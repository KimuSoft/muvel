use crate::models::commons::{OpenedItem, PendingOpen};
use crate::models::index::LocalNovelIndexEntry;
use crate::models::novel::Novel;
use crate::storage::{episode_io, index_manager, item_index_manager, novel_io};
use chrono::Utc;
use std::ffi::OsStr;
use tauri::{AppHandle, State};

/// 애플리케이션 실행 시 또는 다른 경로로 파일이 열렸을 때 해당 파일을 처리합니다.
///
/// # 인자
/// * `app`: Tauri App 참조.
/// * `file_path_osstr`: 파일 경로 OsStr 참조.
///
/// # 반환값
/// * `Result<(), String>`: 성공 시 빈 튜플, 실패 시 에러 메시지 문자열.
pub fn handle_opened_file(
    app_handle: &AppHandle,
    pending: &State<PendingOpen>,
    file_path: &std::path::Path, // ← &Path 로 변경
) -> Result<(), String> {
    println!("파일 열기 시도: {:?}", file_path); // 파일 열기 시도 로그

    if !file_path.exists() {
        return Err(format!("파일이 존재하지 않습니다: {:?}", file_path));
    }

    let extension = file_path.extension().and_then(OsStr::to_str);

    match extension {
        Some("muvl") => {
            // *.muvl 파일 처리 (소설 메타데이터)
            // 파일명이 "novel-metadata.muvl"인지 확인 (선택 사항이지만 권장)
            if file_path.file_name().and_then(OsStr::to_str)
                != Some(novel_io::NOVEL_METADATA_FILENAME)
            {
                return Err(format!(
                    "열린 파일이 표준 소설 메타데이터 파일이 아닙니다: {:?}",
                    file_path.file_name()
                ));
            }

            let novel_root_path = file_path.parent().ok_or_else(|| {
                format!(
                    "소설 파일의 부모 디렉토리를 가져올 수 없습니다: {:?}",
                    file_path
                )
            })?;

            let novel_data: Novel = novel_io::read_novel_metadata(novel_root_path)
                .map_err(|e| format!("소설 메타데이터 읽기 실패 ({:?}): {}", novel_root_path, e))?;

            let novel_id = novel_data.id.clone();
            let novel_title = novel_data.title.clone();
            let current_time_iso = Utc::now().to_rfc3339(); // 현재 시간을 ISO 형식으로

            // 소설 인덱스에 등록/업데이트
            // LocalNovelIndexEntry 구조체는 models.rs 정의를 따름
            let entry = LocalNovelIndexEntry {
                id: novel_id.clone(),
                title: novel_title,
                path: Some(novel_root_path.to_string_lossy().into_owned()),
                episode_count: novel_data.episode_count, // LocalNovelData에서 가져옴
                thumbnail: novel_data.thumbnail,         // LocalNovelData에서 가져옴
                last_opened: Some(current_time_iso),     // 파일 열람 시 현재 시간으로 업데이트
            };

            index_manager::upsert_novel_entry(&app_handle, novel_id.clone(), entry)
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
            // *.mvle 파일 처리 (에피소드 데이터)
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

            // episodes 디렉토리 이름이 예상과 같은지 확인 (선택 사항)
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

            // 부모 소설 메타데이터 읽기
            let parent_novel_data: Novel =
                novel_io::read_novel_metadata(novel_root_path).map_err(|e| {
                    format!(
                        "에피소드 {}의 부모 소설 메타데이터 읽기 실패: {}",
                        episode_id, e
                    )
                })?;

            let parent_novel_id = parent_novel_data.id.clone();

            // 아이템-소설 인덱스에 매핑 등록/업데이트
            item_index_manager::upsert_item_novel_mapping(
                &app_handle,
                episode_id.clone(),
                parent_novel_id.clone(),
            )
            .map_err(|e| {
                format!(
                    "에피소드 {}와 소설 {} 매핑 실패: {}",
                    episode_id, parent_novel_id, e
                )
            })?;

            println!(
                "에피소드 {}가 아이템 인덱스에서 소설 {}에 매핑됨.",
                episode_id, parent_novel_id
            );

            // (부가 기능) 부모 소설이 소설 인덱스에 없거나 경로가 다르면 업데이트
            // 이 로직은 .muvl 처리와 유사합니다.
            // last_opened 필드를 현재 시간으로 업데이트합니다.
            let parent_novel_current_time_iso = Utc::now().to_rfc3339();
            let parent_novel_entry = LocalNovelIndexEntry {
                id: parent_novel_id.clone(),
                title: parent_novel_data.title.clone(),
                path: Some(novel_root_path.to_string_lossy().into_owned()),
                episode_count: parent_novel_data.episode_count,
                thumbnail: parent_novel_data.thumbnail,
                last_opened: Some(parent_novel_current_time_iso),
            };
            match index_manager::upsert_novel_entry(
                &app_handle,
                parent_novel_id.clone(),
                parent_novel_entry.clone(), // 업데이트된 LocalNovelIndexEntry 사용
            ) {
                Ok(_) => println!(
                    "부모 소설 {} (에피소드 {}용)이 인덱스에 등록/업데이트됨.",
                    parent_novel_id, episode_id
                ),
                Err(e) => eprintln!(
                    // 에러 발생 시 알림 또는 다른 처리 고려
                    "부모 소설 {}의 인덱스 등록/업데이트 중 오류: {}",
                    parent_novel_id, e
                ),
            }

            pending.0.lock().unwrap().push(OpenedItem::Episode {
                novel_id: parent_novel_id.clone(),
                episode_id: episode_id.clone(),
            });
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
