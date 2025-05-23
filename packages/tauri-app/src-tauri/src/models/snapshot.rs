use crate::models::block::Block; // EpisodeBlock[]은 Vec<Block>으로 표현
use crate::models::enums::snapshot_reason::SnapshotReason;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EpisodeSnapshot {
    pub id: String,             // 스냅샷 자체의 고유 ID
    pub episode_id: String,     // 이 스냅샷이 속한 에피소드의 ID
    pub reason: SnapshotReason, // 스냅샷 생성 이유
    pub blocks: Vec<Block>,     // 스냅샷 시점의 에피소드 블록 전체
    #[serde(rename = "createdAt")]
    pub created_at: String, // 스냅샷 생성 시각 (ISO 8601)
}
