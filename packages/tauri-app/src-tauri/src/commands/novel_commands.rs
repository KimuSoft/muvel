// src-tauri/src/commands/novel_commands.rs

use std::path::PathBuf;
use tauri::{command, AppHandle};
// AppHandle과 command 어트리뷰트 사용

use crate::models::{CreateLocalNovelOptions, LocalNovelData, LocalNovelIndexEntry, ShareType, UpdateLocalNovelData as TsUpdateLocalNovelData, UserPublicDto};
// storage 모듈 및 models 모듈의 타입들을 가져옵니다.
use crate::storage::{index_manager, novel_io};
// uuid 라이브러리를 사용하여 새 ID를 생성합니다. Cargo.toml에 uuid = { version = "1", features = ["v4"] } 추가 필요.
use uuid::Uuid;


// TypeScript의 `UpdateLocalNovelData`에 대응하는 Rust 구조체
// (models.rs에 이미 UpdateLocalNovelData로 정의되어 있다면 그것을 사용해도 됩니다.
// 여기서는 커맨드 인자용으로 명확히 하기 위해 별도 정의 또는 models.rs의 것 사용)
// use crate::models::UpdateLocalNovelData as RustUpdateLocalNovelData;


/// 새로운 로컬 소설 프로젝트(폴더 구조, 메타데이터 파일)를 생성하고 인덱스에 등록합니다.
/// TypeScript의 `createLocalNovel` 함수에 대응합니다.
#[command]
pub fn create_local_novel_command(
    app_handle: AppHandle,
    options: CreateLocalNovelOptions, // 프론트엔드에서 CreateLocalNovelOptions 타입으로 전달된 데이터
) -> Result<LocalNovelData, String> {
    // 1. 새 소설을 위한 UUID 생성
    let novel_id = Uuid::new_v4().to_string();

    // 2. 실제 소설 프로젝트가 저장될 경로 구성
    //    예: targetDirectoryPath / novel_id (또는 title을 slugify한 이름)
    //    여기서는 novel_id를 폴더명으로 사용한다고 가정합니다.
    //    폴더명 충돌 방지 로직이 필요할 수 있습니다.
    let mut novel_root_path = PathBuf::from(&options.target_directory_path);
    novel_root_path.push(&novel_id); // 예: /사용자/문서/내소설들/uuid-1234

    // 3. 기본 디렉토리 구조 생성 (루트, episodes, resources)
    novel_io::create_novel_directories(&novel_root_path)?; // 에러 시 `?`로 전파

    // 4. 초기 LocalNovelData 객체 생성
    let current_time_iso = chrono::Utc::now().to_rfc3339(); // 현재 시간을 ISO 문자열로
    let initial_novel_data = LocalNovelData {
        id: novel_id.clone(),
        title: options.title.clone(),
        description: None,
        tags: Some(Vec::new()),
        episode_count: Some(0), // 초기 에피소드 수
        thumbnail: None,
        share: ShareType::Local, // 로컬 소설이므로 ShareType::Local
        author: Some(UserPublicDto { // 로컬 소설의 기본 author 정보 (더미 또는 null)
            id: "local-user".to_string(),
            nickname: "로컬 사용자".to_string(), // 또는 앱 설정에서 가져온 사용자명
            profile_image_url: None,
        }),
        created_at: current_time_iso.clone(),
        updated_at: current_time_iso,
        episodes: Some(Vec::new()), // 초기에는 빈 에피소드 목록
        local_path: Some(novel_root_path.to_string_lossy().into_owned()), // 경로 정보 저장 (내부용)
    };

    // 5. 생성된 LocalNovelData를 .muvl 파일에 저장
    novel_io::write_novel_metadata(&novel_root_path, &initial_novel_data)?;

    // 6. 중앙 인덱스에 새 소설 정보 등록
    let index_entry = LocalNovelIndexEntry {
        id: novel_id.clone(),
        title: options.title.clone(),
        path: Some(novel_root_path.to_string_lossy().into_owned()), // 인덱스에도 경로 저장
        episode_count: Some(0),
        thumbnail: None,
        last_opened: None,
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
                Err(format!("소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.", novel_id))
            }
        }
        None => Err(format!("인덱스에서 소설 ID {} 를 찾을 수 없습니다.", novel_id)),
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
                if let Some(thumbnail) = data.thumbnail { // 썸네일은 경로 문자열만 업데이트
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
                index_manager::upsert_novel_entry(&app_handle, novel_id.clone(), updated_index_entry)?;


                // 6. 업데이트된 전체 소설 데이터를 프론트엔드에 반환합니다.
                Ok(current_novel_data)
            } else {
                Err(format!("소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.", novel_id))
            }
        }
        None => Err(format!("업데이트할 소설 ID {} 를 인덱스에서 찾을 수 없습니다.", novel_id)),
    }
}

/// 새로운 UUID를 생성하여 반환합니다.
/// TypeScript의 `generateNewUuid` 함수에 대응합니다.
#[command]
pub fn generate_uuid_command() -> Result<String, String> {
    Ok(Uuid::new_v4().to_string())
}
