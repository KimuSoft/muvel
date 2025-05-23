use chrono::Utc;
use std::path::PathBuf;
use tauri::AppHandle;
use uuid::Uuid;

use crate::models::enums::snapshot_reason::SnapshotReason;
use crate::models::snapshot::EpisodeSnapshot;
use crate::storage::{episode_io, index_manager, item_index_manager, snapshot_io}; // episode_io 등 필요

pub struct SnapshotRepository<'a> {
    app_handle: &'a AppHandle,
}

impl<'a> SnapshotRepository<'a> {
    pub fn new(app_handle: &'a AppHandle) -> Self {
        Self { app_handle }
    }

    /// 특정 에피소드의 현재 내용을 기반으로 새 스냅샷을 생성하고 저장합니다.
    pub fn create_snapshot(
        &self,
        episode_id: &str,
        reason: SnapshotReason,
    ) -> Result<EpisodeSnapshot, String> {
        // 1. episode_id로부터 novel_root_path를 알아낸다.
        let novel_id = item_index_manager::get_item_entry(self.app_handle, episode_id)?
            .ok_or_else(|| {
                format!(
                    "아이템 인덱스에서 에피소드 ID {}의 부모 소설 정보를 찾을 수 없습니다.",
                    episode_id
                )
            })?
            .novel_id;
        let novel_entry = index_manager::get_novel_entry(self.app_handle, &novel_id)?
            .ok_or_else(|| format!("소설 ID {}를 인덱스에서 찾을 수 없습니다.", novel_id))?;
        let novel_root_path = PathBuf::from(novel_entry.path.ok_or("소설 경로 없음")?);

        // 2. 현재 에피소드 데이터를 읽어온다.
        let current_episode_data = episode_io::read_episode_content(&novel_root_path, episode_id)?;

        // 3. 스냅샷 객체 생성
        let snapshot = EpisodeSnapshot {
            id: Uuid::new_v4().to_string(),
            episode_id: episode_id.to_string(),
            reason,
            blocks: current_episode_data.blocks, // 현재 에피소드의 블록 복사
            created_at: Utc::now().to_rfc3339(),
        };

        // 4. 스냅샷 파일 저장
        snapshot_io::write_snapshot_file(&novel_root_path, episode_id, &snapshot)?;

        Ok(snapshot)
    }

    /// 특정 에피소드에 대한 모든 스냅샷 목록을 가져옵니다.
    pub fn get_all_snapshots(&self, episode_id: &str) -> Result<Vec<EpisodeSnapshot>, String> {
        // episode_id로부터 novel_root_path를 알아낸다.
        let novel_id = item_index_manager::get_item_entry(self.app_handle, episode_id)?
            .ok_or_else(|| {
                format!(
                    "아이템 인덱스에서 에피소드 ID {}의 부모 소설 정보를 찾을 수 없습니다.",
                    episode_id
                )
            })?
            .novel_id;
        let novel_entry = index_manager::get_novel_entry(self.app_handle, &novel_id)?
            .ok_or_else(|| format!("소설 ID {}를 인덱스에서 찾을 수 없습니다.", novel_id))?;
        let novel_root_path = PathBuf::from(novel_entry.path.ok_or("소설 경로 없음")?);

        snapshot_io::list_snapshots_for_episode(&novel_root_path, episode_id)
    }
}
