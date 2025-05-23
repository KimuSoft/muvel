use crate::models::episode::EpisodeMetadataUpdatePayload;
use crate::models::novel::{
    CreateLocalNovelOptions, EpisodeSummaryData, Novel, NovelFullDetails, UpdateLocalNovelData,
};
use crate::repositories::episode_repository::EpisodeRepository;
use crate::repositories::novel_repository::NovelRepository;
use std::process::Command;
use tauri::{command, AppHandle};

#[command]
pub fn create_local_novel_command(
    app_handle: AppHandle,
    options: CreateLocalNovelOptions,
) -> Result<Novel, String> {
    let repo = NovelRepository::new(&app_handle);
    repo.create_novel(options)
}

#[command]
pub fn get_local_novel_details_command(
    app_handle: AppHandle,
    novel_id: String,
) -> Result<NovelFullDetails, String> {
    let repo = NovelRepository::new(&app_handle);
    repo.get_novel_details(&novel_id)
}

#[command]
pub fn update_local_novel_metadata_command(
    app_handle: AppHandle,
    novel_id: String,
    data: UpdateLocalNovelData,
) -> Result<NovelFullDetails, String> {
    let repo = NovelRepository::new(&app_handle);
    repo.update_novel_metadata(&novel_id, data)
}

#[command]
pub fn remove_novel_project_command(app_handle: AppHandle, novel_id: String) -> Result<(), String> {
    let repo = NovelRepository::new(&app_handle);
    repo.delete_novel_project(&novel_id)
}

#[command]
pub fn open_novel_project_folder_command(
    app_handle: AppHandle,
    novel_id: String,
) -> Result<(), String> {
    let repo = NovelRepository::new(&app_handle);
    let novel_root_path = repo.get_novel_root_path(&novel_id)?;

    if !novel_root_path.exists() || !novel_root_path.is_dir() {
        return Err(format!(
            "소설 프로젝트 경로를 찾을 수 없거나 디렉토리가 아닙니다: '{}'",
            novel_root_path.display()
        ));
    }

    let path_to_open = novel_root_path
        .to_str()
        .ok_or_else(|| format!("경로를 문자열로 변환할 수 없습니다: {:?}", novel_root_path))?;

    let open_result = if cfg!(target_os = "windows") {
        Command::new("explorer").arg(path_to_open).spawn()
    } else if cfg!(target_os = "macos") {
        Command::new("open").arg(path_to_open).spawn()
    } else if cfg!(target_os = "linux") {
        Command::new("xdg-open").arg(path_to_open).spawn()
    } else {
        return Err("지원되지 않는 운영체제입니다.".to_string());
    };

    match open_result {
        Ok(_) => Ok(()),
        Err(e) => Err(format!(
            "파일 탐색기에서 폴더를 여는 데 실패했습니다 ('{}'): {}",
            novel_root_path.display(),
            e
        )),
    }
}

#[command]
pub fn update_local_novel_episodes_metadata_command(
    app_handle: AppHandle,
    _novel_id: String,
    episode_diffs: Vec<EpisodeMetadataUpdatePayload>,
) -> Result<Vec<EpisodeSummaryData>, String> {
    let episode_repo = EpisodeRepository::new(&app_handle);
    episode_repo.batch_update_episode_metadata(episode_diffs)
}

/// 특정 소설의 'resources/images' 디렉토리에 이미지를 저장하고 절대 경로를 반환합니다.
/// (기존 image_commands.rs의 save_image_to_novel_resources_command 대체)
#[command]
pub fn save_novel_image_command(
    app_handle: AppHandle,
    novel_id: String,
    original_file_name: String,
    file_bytes: Vec<u8>, // Tauri는 Vec<u8>를 통해 바이너리 데이터를 잘 처리합니다.
) -> Result<String, String> {
    let repo = NovelRepository::new(&app_handle);
    repo.save_image_to_novel(&novel_id, &original_file_name, file_bytes)
}
