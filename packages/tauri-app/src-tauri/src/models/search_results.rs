use crate::models::enums::episode_type::EpisodeType;
use crate::models::enums::wiki_page_category::WikiPageCategory;
use serde::{Deserialize, Serialize};
// MuvelBlockType, EpisodeBlockType, WikiBlockType은 String으로 처리합니다.

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq, Hash)] // Hash 추가 (HashSet 등에서 사용 가능하도록)
#[serde(rename_all = "snake_case")]
pub enum NovelSearchItemType {
    EpisodeBlock,
    Episode,
    WikiPage,
    WikiBlock,
    // NovelMetadata, // 필요시 추가 (소설 제목, 설명 등)
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NovelSearchEpisodeItem {
    pub id: String,
    pub novel_id: String,
    pub item_type: NovelSearchItemType,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>, // Episode.description은 필수지만, 검색 결과에서는 Option으로
    pub content_length: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ai_rating: Option<f32>,
    pub order: f32,
    pub episode_type: EpisodeType,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NovelSearchWikiPageItem {
    pub id: String,
    pub novel_id: String,
    pub item_type: NovelSearchItemType,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub category: Option<WikiPageCategory>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub tags: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thumbnail: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NovelSearchEpisodeBlockItem {
    pub id: String, // Block ID
    pub novel_id: String,
    pub item_type: NovelSearchItemType,
    pub content: String,    // 스니펫
    pub block_type: String, // EpisodeBlockType
    pub order: i32,         // Block order
    pub episode_id: String,
    pub episode_name: String,
    pub episode_number: f32, // Episode order
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NovelSearchWikiBlockItem {
    pub id: String, // Block ID
    pub novel_id: String,
    pub item_type: NovelSearchItemType,
    pub content: String,    // 스니펫
    pub block_type: String, // WikiBlockType
    pub order: i32,         // Block order
    pub wiki_page_id: String,
    pub wiki_page_name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(untagged)] // item_type 필드로 프론트에서 구분
pub enum NovelSearchResult {
    Episode(NovelSearchEpisodeItem),
    EpisodeBlock(NovelSearchEpisodeBlockItem),
    WikiPage(NovelSearchWikiPageItem),
    WikiBlock(NovelSearchWikiBlockItem),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SearchInNovelResponse {
    pub hits: Vec<NovelSearchResult>,
    pub query: String,
    pub processing_time_ms: u64,
    pub limit: usize,
    pub offset: usize,
    pub estimated_total_hits: usize,
}
