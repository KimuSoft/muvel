use chrono::Utc;
use slug::slugify;
use std::path::PathBuf;
use tauri::{command, AppHandle};

use crate::models::{
    CreateLocalNovelOptions, EpisodeMetadataUpdatePayload, LocalNovelData,
    LocalNovelDataEpisodesSummary, LocalNovelIndexEntry, ShareType,
    UpdateLocalNovelData as TsUpdateLocalNovelData,
};
use crate::storage::{index_manager, novel_io};
use uuid::Uuid;

/// 새로운 로컬 소설 프로젝트(폴더 구조, 메타데이터 파일)를 생성하고 인덱스에 등록합니다.
/// TypeScript의 `createLocalNovel` 함수에 대응합니다.
#[command]
pub fn create_local_novel_command(
    app_handle: AppHandle,
    options: CreateLocalNovelOptions,
) -> Result<LocalNovelData, String> {
    // 1. 새 소설을 위한 UUID 생성
    let novel_id = Uuid::new_v4().to_string();

    // 2. 실제 소설 프로젝트가 저장될 루트 경로 구성
    let mut novel_root_path = PathBuf::from(&options.target_directory_path);
    let novel_folder_name = slugify(&options.title);
    novel_root_path.push(novel_folder_name); // 예: /Users/Me/MyNovels/여신이 되어버린 이야기!

    if novel_root_path.exists() && novel_root_path.is_dir() {
        return Err(format!(
            "이미 폴더가 존재합니다: {:?}. 다른 소설 제목을 사용하거나 기존 폴더를 확인해주세요.",
            novel_root_path
        ));
    }
    // 만약 파일이 존재한다면 (디렉토리가 아니라면) 그것도 에러 처리 가능
    if novel_root_path.exists() && !novel_root_path.is_dir() {
        return Err(format!(
            "같은 이름의 파일이 이미 존재합니다: {:?}",
            novel_root_path
        ));
    }

    // 3. 기본 디렉토리 구조 생성 (루트, episodes, resources)
    //    novel_io::create_novel_directories는 전달된 novel_root_path 자체를 생성하고,
    //    그 안에 episodes 및 resources 폴더를 생성합니다.
    novel_io::create_novel_directories(&novel_root_path)?; // 에러 시 `?`로 전파

    // 4. 초기 LocalNovelData 객체 생성
    let current_time_iso = Utc::now().to_rfc3339(); // 현재 시간을 ISO 8601 문자열로
    let initial_novel_data = LocalNovelData {
        id: novel_id.clone(),
        title: options.title.clone(),
        description: None,
        tags: Some(Vec::new()),
        episode_count: Some(0), // 초기 에피소드 수
        thumbnail: None,
        share: ShareType::Local, // 로컬 소설이므로 ShareType::Local
        author: None,
        created_at: current_time_iso.clone(),
        updated_at: current_time_iso.clone(), // 생성 시점에는 createdAt과 동일
        episodes: Some(Vec::new()), // 초기에는 빈 에피소드 목록 (LocalNovelDataEpisodesSummary 타입의 Vec)
        // Rust 내부 관리용 필드 예시: 이 필드는 LocalNovelData 구조체에 정의되어 있어야 함
        local_path: Some(novel_root_path.to_string_lossy().into_owned()),
    };

    // 5. 생성된 LocalNovelData를 .muvl 파일(novel-metadata.muvl)에 저장
    novel_io::write_novel_metadata(&novel_root_path, &initial_novel_data)?;

    // 6. 중앙 인덱스에 새 소설 정보 등록
    let index_entry = LocalNovelIndexEntry {
        id: novel_id.clone(),
        title: options.title.clone(),
        // LocalNovelIndexEntry의 path 필드에는 소설 루트 폴더 경로 저장
        path: Some(novel_root_path.to_string_lossy().into_owned()),
        episode_count: Some(0),
        thumbnail: None,
        last_opened: None, // 초기에는 lastOpened 없음
    };
    index_manager::upsert_novel_entry(&app_handle, novel_id.clone(), index_entry)?;

    // 7. 생성된 소설 데이터를 프론트엔드에 반환
    Ok(initial_novel_data)
}

/// 특정 로컬 소설의 상세 정보를 가져옵니다.
/// TypeScript의 `getLocalNovelDetails` 함수에 대응합니다.
#[command]
pub fn get_local_novel_details_command(
    app_handle: AppHandle,
    novel_id: String,
) -> Result<LocalNovelData, String> {
    // 1. 인덱스에서 novel_id에 해당하는 소설의 루트 경로를 가져옵니다.
    let novel_entry_opt = index_manager::get_novel_entry(&app_handle, &novel_id)?;

    match novel_entry_opt {
        Some(entry) => {
            if let Some(path_str) = entry.path {
                let novel_root_path = PathBuf::from(path_str);
                // 2. 해당 경로의 .muvl 파일을 읽어 LocalNovelData를 반환합니다.
                //    이때, episodes 필드를 채우기 위해 episode_io 모듈의 함수를 호출할 수 있습니다.
                //    (단계적 접근: 우선은 .muvl의 내용만 반환하고, episodes는 나중에 채우거나,
                //     .muvl 파일에 에피소드 요약 정보가 있다면 그것을 사용)
                let mut novel_data = novel_io::read_novel_metadata(&novel_root_path)?;

                // 만약 LocalNovelData가 episodes 필드를 Option<Vec<ApiEpisode>> 등으로 가지고 있고,
                // .muvl 파일에 에피소드 요약 정보(episodesSummary)가 있다면 여기서 채워넣거나,
                // 또는 모든 .mvle 파일을 읽어 실제 Episode 객체 목록을 만들어 채울 수 있습니다.
                // "소설 에피소드 리스트 전체를 조회할 때 그냥 각 episode를 긁게 하자"는 의견에 따라,
                // 여기서 모든 에피소드 내용을 읽어 채우는 로직을 추가할 수 있습니다.
                // (이 부분은 episode_io.rs 및 episode_commands.rs 구현과 연계됩니다)
                // 지금은 .muvl에 episodesSummary가 저장되어 있고, 그것을 LocalNovelData.episodes에
                // ApiEpisode 형태로 변환하여 넣는다고 가정하거나, 비워둡니다.
                // 여기서는 LocalNovelData.episodes가 Option<Vec<LocalEpisodeData>>라고 가정하고,
                // 실제 에피소드 내용을 읽어오는 것은 episode_commands에서 별도로 처리하거나,
                // 이 함수가 더 많은 일을 하도록 확장할 수 있습니다.
                // 우선은 .muvl에 저장된 내용만 반환하는 것으로 가정합니다.
                // (LocalNovelData의 episodes 필드가 episodesSummary에 해당한다고 가정)

                // 경로 정보를 local_path 필드에 확실히 넣어줍니다 (models.rs 정의에 따라).
                novel_data.local_path = Some(novel_root_path.to_string_lossy().into_owned());

                Ok(novel_data)
            } else {
                Err(format!(
                    "소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.",
                    novel_id
                ))
            }
        }
        None => Err(format!(
            "인덱스에서 소설 ID {} 를 찾을 수 없습니다.",
            novel_id
        )),
    }
}

/// 특정 로컬 소설의 메타데이터를 업데이트합니다.
/// TypeScript의 `updateLocalNovelMetadata` 함수에 대응합니다.
#[command]
pub fn update_local_novel_metadata_command(
    app_handle: AppHandle,
    novel_id: String,
    data: TsUpdateLocalNovelData, // 프론트엔드에서 전달된 업데이트할 데이터 (Partial 형태)
) -> Result<LocalNovelData, String> {
    // 1. 인덱스에서 novel_id로 소설 루트 경로를 가져옵니다.
    let novel_entry_opt = index_manager::get_novel_entry(&app_handle, &novel_id)?;

    match novel_entry_opt {
        Some(entry) => {
            if let Some(path_str) = entry.path {
                let novel_root_path = PathBuf::from(path_str);
                // 2. 현재 저장된 .muvl 파일 내용을 읽어옵니다.
                let mut current_novel_data = novel_io::read_novel_metadata(&novel_root_path)?;

                // 3. 전달받은 data로 current_novel_data의 필드를 업데이트합니다.
                if let Some(title) = data.title {
                    current_novel_data.title = title;
                }
                if let Some(description) = data.description {
                    current_novel_data.description = Some(description);
                }
                if let Some(tags) = data.tags {
                    current_novel_data.tags = Some(tags);
                }
                if let Some(thumbnail) = data.thumbnail {
                    // 썸네일은 경로 문자열만 업데이트
                    current_novel_data.thumbnail = Some(thumbnail);
                }
                // author는 로컬에서 보통 변경하지 않음.
                current_novel_data.updated_at = chrono::Utc::now().to_rfc3339();

                // 4. 업데이트된 데이터를 다시 .muvl 파일에 저장합니다.
                novel_io::write_novel_metadata(&novel_root_path, &current_novel_data)?;

                // 5. 만약 인덱스에 캐싱된 정보(예: title)도 업데이트해야 한다면 여기서 처리
                //    (현재 LocalNovelIndexEntry는 title을 가지고 있으므로 업데이트 필요)
                let updated_index_entry = LocalNovelIndexEntry {
                    id: novel_id.clone(),
                    title: current_novel_data.title.clone(),
                    path: Some(novel_root_path.to_string_lossy().into_owned()),
                    episode_count: current_novel_data.episodes.as_ref().map(|e| e.len() as i32), // 예시
                    thumbnail: current_novel_data.thumbnail.clone(),
                    last_opened: entry.last_opened, // 기존 값 유지 또는 업데이트
                };
                index_manager::upsert_novel_entry(
                    &app_handle,
                    novel_id.clone(),
                    updated_index_entry,
                )?;

                // 6. 업데이트된 전체 소설 데이터를 프론트엔드에 반환합니다.
                Ok(current_novel_data)
            } else {
                Err(format!(
                    "소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.",
                    novel_id
                ))
            }
        }
        None => Err(format!(
            "업데이트할 소설 ID {} 를 인덱스에서 찾을 수 없습니다.",
            novel_id
        )),
    }
}

// TypeScript의 `removeNovelDataAndFromIndex` 함수에 대응하는 Tauri 커맨드입니다.
// 이 커맨드는 인덱스에서 항목을 제거하고, 관련 파일/폴더도 삭제합니다.
#[command]
pub fn remove_novel_project_command(app_handle: AppHandle, novel_id: String) -> Result<(), String> {
    // 1. 인덱스에서 해당 novel_id의 경로(novel_root_path)를 가져옵니다.
    let entry_opt = index_manager::get_novel_entry(&app_handle, &novel_id)?;

    if let Some(entry) = entry_opt {
        if let Some(novel_root_str) = entry.path {
            let novel_root_path = PathBuf::from(novel_root_str);
            // 2. storage::novel_io 를 사용하여 실제 파일/폴더를 삭제합니다.
            //    (novel_io.rs 에 delete_novel_project_directory 함수가 정의되어 있다고 가정)
            crate::storage::novel_io::delete_novel_project_directory(&novel_root_path)?;

            // 3. 파일/폴더 삭제 성공 시, 인덱스에서도 해당 항목을 제거합니다.
            index_manager::remove_novel_entry(&app_handle, &novel_id)?;
            Ok(())
        } else {
            // 경로 정보가 없는 경우, 인덱스에서만 제거 시도 (파일은 못 찾음)
            index_manager::remove_novel_entry(&app_handle, &novel_id)?;
            Err(format!("소설 ID {} 에 대한 경로 정보가 인덱스에 없어 파일은 삭제하지 못했지만, 인덱스에서는 제거 시도했습니다.", novel_id))
        }
    } else {
        Err(format!(
            "삭제할 소설 ID {} 를 인덱스에서 찾을 수 없습니다.",
            novel_id
        ))
    }
}

#[command]
pub fn update_local_novel_episodes_metadata_command(
    app_handle: AppHandle,
    novel_id: String,
    episode_diffs: Vec<EpisodeMetadataUpdatePayload>,
) -> Result<Vec<LocalNovelDataEpisodesSummary>, String> {
    // 업데이트된 에피소드 요약 정보 배열 반환
    let novel_entry = index_manager::get_novel_entry(&app_handle, &novel_id)?
        .ok_or_else(|| format!("소설 ID {} 를 인덱스에서 찾을 수 없습니다.", novel_id))?;
    let novel_root_path_str = novel_entry.path.ok_or_else(|| {
        format!(
            "소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.",
            novel_id
        )
    })?;
    let novel_root_path = PathBuf::from(novel_root_path_str);

    let mut current_novel_data = novel_io::read_novel_metadata(&novel_root_path)?;

    let mut episodes_updated_overall = false;
    if let Some(ref mut current_episodes_summary_vec) = current_novel_data.episodes {
        for diff_item in episode_diffs {
            let mut individual_episode_updated = false;
            if let Some(summary_to_update) = current_episodes_summary_vec
                .iter_mut()
                .find(|ep_summary| ep_summary.id == diff_item.id)
            {
                if let Some(new_title) = diff_item.title {
                    if summary_to_update.title != new_title {
                        summary_to_update.title = new_title;
                        individual_episode_updated = true;
                    }
                }
                if let Some(new_order) = diff_item.order {
                    if summary_to_update.order != new_order {
                        summary_to_update.order = new_order;
                        individual_episode_updated = true;
                    }
                }
                if let Some(new_ep_type) = diff_item.episode_type {
                    if summary_to_update.episode_type != new_ep_type {
                        // EpisodeType이 PartialEq를 derive 해야 함
                        summary_to_update.episode_type = new_ep_type;
                        individual_episode_updated = true;
                    }
                }

                if individual_episode_updated {
                    summary_to_update.updated_at = Utc::now().to_rfc3339();
                    episodes_updated_overall = true;
                }
            } else {
                eprintln!(
                    "Warning: Episode ID {} in diffs not found in novel metadata for novel {}.",
                    diff_item.id, novel_id
                );
            }
        }

        // 순서(order) 변경이 있었을 수 있으므로, 전체 에피소드 요약 목록을 order 기준으로 재정렬합니다.
        // 실제로는 order 필드가 변경된 diff_item이 하나라도 있었는지 확인 후 정렬하는 것이 더 효율적입니다.
        current_episodes_summary_vec.sort_by(|a, b| a.order.partial_cmp(&b.order).unwrap());
    } else {
        if !episode_diffs.is_empty() {
            return Err(format!(
                "소설 ID {} 에는 업데이트할 에피소드 목록이 없습니다. (.muvl 파일 확인 필요)",
                novel_id
            ));
        }
    }

    if episodes_updated_overall {
        current_novel_data.updated_at = Utc::now().to_rfc3339();
    }

    novel_io::write_novel_metadata(&novel_root_path, &current_novel_data)?;

    Ok(current_novel_data.episodes.unwrap_or_else(Vec::new))
}

/// 새로운 UUID를 생성하여 반환합니다.
/// TypeScript의 `generateNewUuid` 함수에 대응합니다.
#[command]
pub fn generate_uuid_command() -> Result<String, String> {
    Ok(Uuid::new_v4().to_string())
}
