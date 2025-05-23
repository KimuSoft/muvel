use crate::models::enums::snapshot_reason::SnapshotReason;
use crate::models::snapshot::EpisodeSnapshot;
use crate::repositories::snapshot_repository::SnapshotRepository;
use tauri::{command, AppHandle};

#[command]
pub fn create_episode_snapshot_command(
    app_handle: AppHandle,
    episode_id: String,
    reason: SnapshotReason,
) -> Result<EpisodeSnapshot, String> {
    let repo = SnapshotRepository::new(&app_handle);
    repo.create_snapshot(&episode_id, reason)
}

#[command]
pub fn get_episode_snapshots_command(
    app_handle: AppHandle,
    episode_id: String,
) -> Result<Vec<EpisodeSnapshot>, String> {
    let repo = SnapshotRepository::new(&app_handle);
    repo.get_all_snapshots(&episode_id)
}
