use crate::models::commons::{OpenedItem, PendingOpen};
use crate::models::index::LocalNovelIndexEntry;
use crate::models::novel::Novel;
use crate::storage::{episode_io, index_manager, item_index_manager, novel_io};
use chrono::Utc;
use std::ffi::OsStr;
use std::path::Path;
use tauri::{AppHandle, State};

pub fn handle_opened_file(
    app_handle: &AppHandle,
    pending: &State<PendingOpen>,
    file_path: &Path,
) -> Result<(), String> {
    println!("파일 열기 시도: {:?}", file_path);

    if !file_path.exists() {
        return Err(format!("파일이 존재하지 않습니다: {:?}", file_path));
    }

    let extension = file_path.extension().and_then(OsStr::to_str);

    match extension {
        Some("muvl") => {
            let novel_root_path = file_path.parent().ok_or_else(|| {
                format!(
                    "소설 파일의 부모 디렉토리를 가져올 수 없습니다: {:?}",
                    file_path
                )
            })?;

            // novel_io::read_novel_metadata_with_path 사용
            let (novel_data, _muvl_file_path) =
                novel_io::read_novel_metadata_with_path(novel_root_path).map_err(|e| {
                    format!("소설 메타데이터 읽기 실패 ({:?}): {}", novel_root_path, e)
                })?;

            let novel_id = novel_data.id.clone();
            let novel_title = novel_data.title.clone();
            let current_time_iso = Utc::now().to_rfc3339();

            let entry = LocalNovelIndexEntry {
                id: novel_id.clone(),
                title: novel_title,
                path: Some(novel_root_path.to_string_lossy().into_owned()),
                episode_count: novel_data.episode_count,
                thumbnail: novel_data.thumbnail,
                last_opened: Some(current_time_iso),
            };

            index_manager::upsert_novel_entry(app_handle, novel_id.clone(), entry)
                .map_err(|e| format!("소설 {}의 인덱스 등록/업데이트 실패: {}", novel_id, e))?;

            println!(
                "소설이 인덱스에 등록/업데이트됨: ID = {}, 경로 = {:?}",
                novel_id, novel_root_path
            );
            pending
                .0
                .lock()
                .unwrap()
                .push(OpenedItem::Novel { novel_id });
        }
        Some("mvle") => {
            let episode_id_osstr = file_path.file_stem().ok_or_else(|| {
                format!(
                    "파일 이름(에피소드 ID)을 가져올 수 없습니다: {}",
                    file_path.display()
                )
            })?;
            let episode_id = episode_id_osstr.to_string_lossy().into_owned();
            let episodes_dir = file_path.parent().ok_or_else(|| {
                format!(
                    "부모 디렉토리(episodes 폴더)를 가져올 수 없습니다: {}",
                    file_path.display()
                )
            })?;

            if episodes_dir.file_name().and_then(OsStr::to_str)
                != Some(episode_io::EPISODES_DIRNAME)
            {
                return Err(format!(
                    "에피소드 파일이 표준 'episodes' 디렉토리에 없습니다: {:?}",
                    episodes_dir
                ));
            }
            let novel_root_path = episodes_dir.parent().ok_or_else(|| {
                format!(
                    "episodes 디렉토리에서 소설 루트 디렉토리를 가져올 수 없습니다: {:?}",
                    episodes_dir
                )
            })?;

            // novel_io::read_novel_metadata_with_path 사용
            let (parent_novel_data, _) = novel_io::read_novel_metadata_with_path(novel_root_path)
                .map_err(|e| {
                format!(
                    "에피소드 {}의 부모 소설 메타데이터 읽기 실패: {}",
                    episode_id, e
                )
            })?;
            let parent_novel_id = parent_novel_data.id.clone();

            item_index_manager::upsert_item_novel_mapping(
                app_handle,
                episode_id.clone(),
                parent_novel_id.clone(),
                "episode".to_string(),
            )
            .map_err(|e| {
                format!(
                    "에피소드 {}와 소설 {} 매핑 실패: {}",
                    episode_id, parent_novel_id, e
                )
            })?;
            println!(
                "에피소드 {}가 아이템 인덱스에서 소설 {}에 매핑됨 (타입: episode).",
                episode_id, parent_novel_id
            );

            let parent_novel_current_time_iso = Utc::now().to_rfc3339();
            let parent_novel_entry = LocalNovelIndexEntry {
                id: parent_novel_id.clone(),
                title: parent_novel_data.title.clone(),
                path: Some(novel_root_path.to_string_lossy().into_owned()),
                episode_count: parent_novel_data.episode_count,
                thumbnail: parent_novel_data.thumbnail,
                last_opened: Some(parent_novel_current_time_iso),
            };
            if let Err(e) = index_manager::upsert_novel_entry(
                app_handle,
                parent_novel_id.clone(),
                parent_novel_entry.clone(),
            ) {
                eprintln!(
                    "부모 소설 {}의 인덱스 등록/업데이트 중 오류: {}",
                    parent_novel_id, e
                );
            } else {
                println!(
                    "부모 소설 {} (에피소드 {}용)이 인덱스에 등록/업데이트됨.",
                    parent_novel_id, episode_id
                );
            }
            pending.0.lock().unwrap().push(OpenedItem::Episode {
                novel_id: parent_novel_id.clone(),
                episode_id: episode_id.clone(),
            });
        }
        Some("mkwp") => {
            let page_id_osstr = file_path.file_stem().ok_or_else(|| {
                format!(
                    "파일 이름(위키 페이지 ID)을 가져올 수 없습니다: {}",
                    file_path.display()
                )
            })?;
            let page_id = page_id_osstr.to_string_lossy().into_owned();
            let wiki_pages_dir = file_path.parent().ok_or_else(|| {
                format!(
                    "부모 디렉토리(wiki 폴더)를 가져올 수 없습니다: {}",
                    file_path.display()
                )
            })?;

            if wiki_pages_dir.file_name().and_then(OsStr::to_str)
                != Some(crate::storage::wiki_page_io::WIKI_PAGES_DIRNAME)
            {
                return Err(format!(
                    "위키 페이지 파일이 표준 '{}' 디렉토리에 없습니다: {:?}",
                    crate::storage::wiki_page_io::WIKI_PAGES_DIRNAME,
                    wiki_pages_dir
                ));
            }
            let novel_root_path = wiki_pages_dir.parent().ok_or_else(|| {
                format!(
                    "wiki 디렉토리에서 소설 루트 디렉토리를 가져올 수 없습니다: {:?}",
                    wiki_pages_dir
                )
            })?;

            // novel_io::read_novel_metadata_with_path 사용
            let (parent_novel_data, _) = novel_io::read_novel_metadata_with_path(novel_root_path)
                .map_err(|e| {
                format!(
                    "위키 페이지 {}의 부모 소설 메타데이터 읽기 실패: {}",
                    page_id, e
                )
            })?;
            let parent_novel_id = parent_novel_data.id.clone();

            item_index_manager::upsert_item_novel_mapping(
                app_handle,
                page_id.clone(),
                parent_novel_id.clone(),
                "wiki_page".to_string(),
            )
            .map_err(|e| {
                format!(
                    "위키 페이지 {}와 소설 {} 매핑 실패: {}",
                    page_id, parent_novel_id, e
                )
            })?;
            println!(
                "위키 페이지 {}가 아이템 인덱스에서 소설 {}에 매핑됨 (타입: wiki_page).",
                page_id, parent_novel_id
            );

            let parent_novel_current_time_iso = Utc::now().to_rfc3339();
            let parent_novel_entry = LocalNovelIndexEntry {
                id: parent_novel_id.clone(),
                title: parent_novel_data.title.clone(),
                path: Some(novel_root_path.to_string_lossy().into_owned()),
                episode_count: parent_novel_data.episode_count,
                thumbnail: parent_novel_data.thumbnail,
                last_opened: Some(parent_novel_current_time_iso),
            };
            if let Err(e) = index_manager::upsert_novel_entry(
                app_handle,
                parent_novel_id.clone(),
                parent_novel_entry.clone(),
            ) {
                eprintln!(
                    "부모 소설 {}의 인덱스 등록/업데이트 중 오류: {}",
                    parent_novel_id, e
                );
            } else {
                println!(
                    "부모 소설 {} (위키 페이지 {}용)이 인덱스에 등록/업데이트됨.",
                    parent_novel_id, page_id
                );
            }
            println!(
                "위키 페이지 {} 열기 요청이 등록되었습니다. (OpenedItem::WikiPage 구현 필요)",
                page_id
            );
        }
        _ => {
            return Err(format!(
                "지원하지 않는 파일 형식이거나 확장자가 없습니다: {:?}",
                file_path
            ));
        }
    }
    Ok(())
}

#[tauri::command]
pub fn take_initial_open(state: State<PendingOpen>) -> Vec<OpenedItem> {
    state.0.lock().unwrap().drain(..).collect()
}
