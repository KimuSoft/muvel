use crate::models::block::Block;
use crate::models::enums::episode_type::EpisodeType;
use crate::models::enums::share_type::ShareType;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LocalEpisodeData {
    pub id: String,
    #[serde(rename = "novelId")]
    pub novel_id: String, // 부모 소설 ID
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(rename = "authorComment")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author_comment: Option<String>,
    #[serde(rename = "contentLength")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content_length: Option<i32>,
    #[serde(rename = "episodeType")]
    pub episode_type: EpisodeType,
    pub order: f32, // 실수형 순서

    #[serde(rename = "flowDoc")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub flow_doc: Option<serde_json::Value>, // any 타입은 JSON Value로 표현

    #[serde(rename = "createdAt")]
    pub created_at: String, // ISO 8601 문자열
    #[serde(rename = "updatedAt")]
    pub updated_at: String, // ISO 8601 문자열

    pub blocks: Vec<Block>, // 에피소드 내용은 블록 배열로 직접 포함
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct EpisodeParentNovelContext {
    /// 부모 소설의 고유 ID (UUID)
    pub id: String,

    /// 부모 소설의 공유 상태 (예: Local, Public 등)
    /// models.rs 또는 공용 타입으로 ShareType enum이 정의되어 있어야 합니다.
    pub share: ShareType,

    /// 부모 소설의 제목 (선택적으로 포함될 수 있음)
    /// UI에 간단히 표시할 때 유용합니다.
    #[serde(skip_serializing_if = "Option::is_none")] // JSON으로 변환 시 None이면 생략
    pub title: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LocalEpisodeDataResponse {
    // LocalEpisodeData의 필드들을 그대로 가져옵니다.
    // (또는 LocalEpisodeData를 필드로 내장(embed)할 수도 있습니다: `#[serde(flatten)] episode_data: LocalEpisodeData,`)
    // 여기서는 필드를 직접 나열하여 명확성을 높입니다.
    pub id: String,
    #[serde(rename = "novelId")]
    pub novel_id: String, // 부모 소설 ID
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(rename = "authorComment")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author_comment: Option<String>,
    #[serde(rename = "contentLength")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content_length: Option<i32>,
    #[serde(rename = "episodeType")]
    pub episode_type: EpisodeType,
    pub order: f32,
    #[serde(rename = "flowDoc")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub flow_doc: Option<serde_json::Value>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
    pub blocks: Vec<Block>,

    // 추가된 필드: 부모 소설의 컨텍스트 정보
    pub novel: EpisodeParentNovelContext,
}

#[derive(Deserialize, Debug)]
pub struct CreateLocalEpisodeOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(rename = "episodeType")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episode_type: Option<EpisodeType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<f32>,
}

#[derive(Deserialize, Debug, Default)]
pub struct UpdateLocalEpisodeMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(rename = "authorComment")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author_comment: Option<String>,
    #[serde(rename = "episodeType")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episode_type: Option<EpisodeType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<f32>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct EpisodeMetadataUpdatePayload {
    pub id: String, // 업데이트할 에피소드의 ID는 필수
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(rename = "episodeType")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episode_type: Option<EpisodeType>, // models.rs에 정의된 EpisodeType enum
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<f32>,
    // 여기에 LocalNovelDataEpisodesSummary에 있는 다른 필드 중 업데이트 가능한 것 추가 가능
    // 예: contentLength (프론트에서 계산해서 보내준다면)
    // description, authorComment 등은 .mvle 파일에 있으므로, 이 커맨드에서는 직접 다루지 않음
    // (만약 .muvl의 요약 정보에도 해당 필드가 있다면 추가 가능)
}

pub type UpdateLocalEpisodeBlocksData = Vec<Block>;
