use crate::models::block::DeltaBlock;
use crate::models::episode::{
    CreateLocalEpisodeOptions, LocalEpisodeDataResponse, UpdateLocalEpisodeMetadata,
};
use crate::models::novel::EpisodeSummaryData;
use crate::repositories::episode_repository::EpisodeRepository;
use tauri::{command, AppHandle};

#[command]
pub fn create_local_episode_command(
    app_handle: AppHandle,
    novel_id: String,
    options: CreateLocalEpisodeOptions,
) -> Result<LocalEpisodeDataResponse, String> {
    let repo = EpisodeRepository::new(&app_handle);
    repo.create_episode(&novel_id, options)
}

#[command]
pub fn get_local_episode_data_command(
    app_handle: AppHandle,
    episode_id: String,
) -> Result<LocalEpisodeDataResponse, String> {
    let repo = EpisodeRepository::new(&app_handle);
    repo.get_episode_data(&episode_id)
}

#[command]
pub fn update_local_episode_metadata_command(
    app_handle: AppHandle,
    episode_id: String,
    metadata: UpdateLocalEpisodeMetadata,
) -> Result<EpisodeSummaryData, String> {
    // 반환 타입 변경 가능성 (리포지토리 반환 타입에 맞춤)
    let repo = EpisodeRepository::new(&app_handle);
    repo.update_episode_metadata(&episode_id, metadata)
}

#[command]
pub fn delete_local_episode_command(
    app_handle: AppHandle,
    episode_id: String,
) -> Result<(), String> {
    let repo = EpisodeRepository::new(&app_handle);
    repo.delete_episode(&episode_id)
}

#[command]
pub fn list_local_episode_summaries_command(
    app_handle: AppHandle,
    novel_id: String,
) -> Result<Vec<EpisodeSummaryData>, String> {
    let repo = EpisodeRepository::new(&app_handle);
    repo.list_episode_summaries_for_novel(&novel_id)
}

#[command]
pub fn sync_local_delta_blocks_command(
    app_handle: AppHandle,
    episode_id: String,
    delta_blocks: Vec<DeltaBlock>,
) -> Result<(), String> {
    let repo = EpisodeRepository::new(&app_handle);
    repo.sync_delta_blocks(&episode_id, delta_blocks)
}
