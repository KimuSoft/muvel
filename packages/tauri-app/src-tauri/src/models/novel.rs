use crate::models::enums::episode_type::EpisodeType;
use crate::models::enums::share_type::ShareType;
use crate::models::wiki_page::WikiPageCategory;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")] // TypeScript 필드명과 일치시키기 위해 추가 (선택적)
pub struct Novel {
    pub id: String,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thumbnail: Option<String>,

    pub share: ShareType, // LocalNovel에서는 ShareType::Local로 고정

    // author: null 이므로 Rust 모델에서는 필드 생략 또는 Option<()> 처리. 여기서는 생략.
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,

    #[serde(rename = "episodeCount")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episode_count: Option<i32>,

    #[serde(rename = "localPath")]
    pub local_path: String, // localPath는 필수 필드로 변경 (TS LocalNovel 기준)

                            // episodes: LocalEpisodeCache[] 필드는 .muvl에 저장되지 않음 (동적 로드)
                            // wikiPages: LocalWikiPageCache[] 필드도 .muvl에 저장되지 않음 (동적 로드)
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CreateLocalNovelOptions {
    pub title: String,
    #[serde(rename = "targetDirectoryPath")]
    pub target_directory_path: Option<String>,
}

#[derive(Deserialize, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct UpdateLocalNovelData {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thumbnail: Option<String>,
    // localPath는 일반적으로 사용자가 직접 업데이트하지 않으므로 제외
}

/// 소설 상세 정보와 해당 소설의 에피소드 요약 목록, 위키 페이지 요약 목록을 함께 담는 구조체입니다.
/// TypeScript의 `LocalNovel` 인터페이스의 응답 형태에 해당될 수 있습니다.
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NovelFullDetails {
    // NovelWithEpisodes 에서 확장
    #[serde(flatten)]
    pub novel: Novel, // Novel 메타데이터
    pub episodes: Vec<EpisodeSummaryData>, // 동적으로 로드된 에피소드 요약 목록
    #[serde(rename = "wikiPages")]
    pub wiki_pages: Vec<WikiPageSummaryData>, // 동적으로 로드된 위키 페이지 요약 목록
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct EpisodeSummaryData {
    pub id: String,
    pub title: String,
    pub order: f32, // 에피소드 순서 (실수형)
    #[serde(rename = "episodeType")]
    pub episode_type: EpisodeType, // 에피소드 타입 (예: Episode, Prologue 등)
    #[serde(rename = "contentLength")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content_length: Option<i32>, // 내용 길이 (블록 수 또는 글자 수 등)
    #[serde(rename = "createdAt")]
    pub created_at: String, // 생성 시각 (ISO 8601)
    #[serde(rename = "updatedAt")]
    pub updated_at: String, // 마지막 업데이트 시각 (ISO 8601)
                    // 필요한 경우 여기에 썸네일 경로 등 추가 필드를 포함할 수 있습니다.
}

/// 위키 페이지 목록 표시에 사용될 경량화된 위키 페이지 요약 정보 구조체입니다.
/// TypeScript의 `LocalWikiPageCache`에 해당합니다.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct WikiPageSummaryData {
    pub id: String,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub category: Option<WikiPageCategory>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thumbnail: Option<String>,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
    // 필요에 따라 tags 요약 등 추가 가능
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NovelWithEpisodes {
    #[serde(flatten)] // Novel 구조체의 필드들을 바로 NovelWithEpisodes의 필드처럼 사용
    pub novel: Novel,
    pub episodes: Vec<EpisodeSummaryData>, // 동적으로 로드된 에피소드 요약 목록
}
