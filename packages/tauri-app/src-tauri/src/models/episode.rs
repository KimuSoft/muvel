use crate::models::block::Block;
use crate::models::enums::episode_type::EpisodeType;
use crate::models::enums::share_type::ShareType;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LocalEpisodeData {
    pub id: String,
    #[serde(rename = "novelId")]
    pub novel_id: String,
    pub title: String,
    #[serde(default)] // 누락된 경우 String::default() 즉, "" 사용
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author_comment: Option<String>,
    #[serde(rename = "contentLength")]
    #[serde(default)] // 누락된 경우 i32::default() 즉, 0 사용
    pub content_length: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ai_rating: Option<f32>,
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

    #[serde(default)] // 이전 데이터에 blocks 필드가 없을 수 있으므로 기본값(빈 Vec) 사용
    pub blocks: Vec<Block>,
}

// --- 나머지 코드 (LocalEpisodeDataResponse, CreateLocalEpisodeOptions 등) ---
// 이 구조체들도 필요에 따라 필드 기본값 처리를 고려할 수 있지만,
// 주로 파일에서 직접 읽는 LocalEpisodeData가 문제입니다.

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct EpisodeParentNovelContext {
    pub id: String,
    pub share: ShareType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LocalEpisodeDataResponse {
    pub id: String,
    #[serde(rename = "novelId")]
    pub novel_id: String,
    pub title: String,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author_comment: Option<String>,
    #[serde(rename = "contentLength")]
    pub content_length: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ai_rating: Option<f32>,
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
    pub novel: EpisodeParentNovelContext,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CreateLocalEpisodeOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)] // description이 필수가 되었으므로, 옵션에서 빠지면 기본값 사용
    pub description: Option<String>,
    #[serde(rename = "episodeType")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episode_type: Option<EpisodeType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<f32>,
}

#[derive(Deserialize, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct UpdateLocalEpisodeMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author_comment: Option<String>,
    #[serde(rename = "episodeType")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episode_type: Option<EpisodeType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ai_rating: Option<f32>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EpisodeMetadataUpdatePayload {
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(rename = "episodeType")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episode_type: Option<EpisodeType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<f32>,
}
