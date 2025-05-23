use crate::models::enums::episode_type::EpisodeType;
use crate::models::enums::share_type::ShareType;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Novel {
    pub id: String,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thumbnail: Option<String>,

    pub share: ShareType, // 항상 ShareType::Local 이어야 함

    // 로컬 소설의 author는 null 또는 더미 데이터를 사용하기로 했으므로 Option 사용
    // #[serde(skip_serializing_if = "Option::is_none")]
    // pub author: Option<UserPublicDto>,
    #[serde(rename = "createdAt")]
    pub created_at: String, // ISO 8601 문자열
    #[serde(rename = "updatedAt")]
    pub updated_at: String, // ISO 8601 문자열

    #[serde(rename = "episodeCount")] // TypeScript 타입과 필드명 일치 (선택적)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episode_count: Option<i32>, // 이 필드 추가

    // @deprecated 이 필드는 사라질 예정
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episodes: Option<Vec<LocalNovelDataEpisodesSummary>>,

    // Rust 내부 관리용 필드 (클라이언트에 직접 노출하지 않을 수 있음)
    #[serde(rename = "localPath")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub local_path: Option<String>,
}

// @deprecated
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct LocalNovelDataEpisodesSummary {
    pub id: String,
    pub title: String,
    pub order: f32,
    #[serde(rename = "episodeType")]
    pub episode_type: EpisodeType,
    #[serde(rename = "contentLength")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content_length: Option<i32>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

#[derive(Deserialize, Debug)]
pub struct CreateLocalNovelOptions {
    pub title: String,
    #[serde(rename = "targetDirectoryPath")]
    pub target_directory_path: Option<String>,
}

#[derive(Deserialize, Debug, Default)]
pub struct UpdateLocalNovelData {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thumbnail: Option<String>,
}
