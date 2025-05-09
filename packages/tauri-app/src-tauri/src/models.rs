use serde::{Deserialize, Serialize};
use serde_repr::{Deserialize_repr, Serialize_repr};

// TypeScript의 `ApiShareType` enum에 대응하는 Rust enum (예시)
// 실제 muvel-api-types의 ShareType과 값을 일치시켜야 합니다.
#[derive(Serialize_repr, Deserialize_repr, Debug, Clone, PartialEq)]
#[repr(u8)]
pub enum ShareType {
    Private = 0,
    Unlisted = 1,
    Public = 2,
    Local = 3, // 로컬 저장용 타입
}

// TypeScript의 `ApiEpisodeType` enum에 대응하는 Rust enum (예시)
#[derive(Serialize_repr, Deserialize_repr, Debug, Clone, PartialEq)]
#[repr(u8)]
pub enum EpisodeType {
    Episode = 0,
    EpisodeGroup = 1,
    Prologue = 2,
    Epilogue = 3,
    Special = 4,
    Memo = 5,
}

// TypeScript의 `ApiUserPublicDto`에 대응하는 Rust 구조체 (예시)
// 로컬 소설의 경우 이 필드는 null이거나 더미 데이터일 수 있습니다.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Default)]
pub struct UserPublicDto {
    pub id: String,
    pub nickname: String,
    #[serde(rename = "profileImageUrl")] // JSON 필드명과 Rust 필드명 규칙이 다를 때 사용
    pub profile_image_url: Option<String>,
}

// TypeScript의 `ApiBlock`에 대응하는 Rust 구조체
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Block {
    pub id: String,
    pub text: String,
    pub content: Vec<serde_json::Value>, // PMNodeJSON[]은 JSON Value의 배열로 표현
    #[serde(rename = "blockType")]
    pub block_type: String, // 실제 BlockType enum을 정의하고 사용할 수도 있습니다.
    pub attr: Option<serde_json::Value>, // BlockAttrs | null 은 Option<JSON Value>로 표현
    pub order: i32,                      // order는 정수형으로 가정
    #[serde(rename = "updatedAt")]
    #[serde(skip_serializing_if = "Option::is_none")]
    // Option 필드는 serialize 시 none이면 생략
    pub updated_at: Option<String>, // 날짜는 ISO 8601 문자열로 처리
}

// TypeScript의 `LocalNovelIndexEntry`에 대응하는 Rust 구조체
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LocalNovelIndexEntry {
    pub id: String,
    pub title: String,
    #[serde(rename = "episodeCount")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episode_count: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thumbnail: Option<String>, // 로컬 리소스 식별자 또는 data URL
    #[serde(rename = "lastOpened")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_opened: Option<String>, // ISO 8601 문자열

    // 이 필드는 Rust 내부에서만 사용하고 클라이언트에 직접 노출하지 않을 수 있습니다.
    // 만약 클라이언트에 노출하지 않으려면, 별도의 DTO를 만들어 변환하거나,
    // 이 구조체 자체를 클라이언트가 직접 받지 않도록 합니다.
    // 여기서는 클라이언트 타입 정의와 유사하게 일단 포함합니다.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>, // 소설 루트 폴더 절대 경로
}

// TypeScript의 `LocalNovelData`에 대응하는 Rust 구조체
// ApiNovel과 유사하게 정의하되, 로컬 특화된 부분을 반영합니다.
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LocalNovelData {
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
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<UserPublicDto>,

    #[serde(rename = "createdAt")]
    pub created_at: String, // ISO 8601 문자열
    #[serde(rename = "updatedAt")]
    pub updated_at: String, // ISO 8601 문자열

    #[serde(rename = "episodeCount")] // TypeScript 타입과 필드명 일치 (선택적)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episode_count: Option<i32>, // 이 필드 추가

    // GetNovelResponseDto와 호환성을 위해 episodes 필드 포함 (Rust가 채워줌)
    // 초기 단계에서는 이 필드를 채우기 위해 Rust가 모든 .mvle 파일을 읽어야 함.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episodes: Option<Vec<LocalNovelDataEpisodesSummary>>,

    // Rust 내부 관리용 필드 (클라이언트에 직접 노출하지 않을 수 있음)
    #[serde(rename = "localPath")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub local_path: Option<String>,
}

// TypeScript의 `LocalEpisodeData`에 대응하는 Rust 구조체
// ApiEpisode와 유사하게 정의하되, 로컬 특화된 부분을 반영합니다.
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
    pub order: i32, // 정수형 순서

    #[serde(rename = "flowDoc")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub flow_doc: Option<serde_json::Value>, // any 타입은 JSON Value로 표현

    #[serde(rename = "createdAt")]
    pub created_at: String, // ISO 8601 문자열
    #[serde(rename = "updatedAt")]
    pub updated_at: String, // ISO 8601 문자열

    pub blocks: Vec<Block>, // 에피소드 내용은 블록 배열로 직접 포함

                            // GetEpisodeResponseDto 호환성을 위해 Rust가 채워줄 수 있는 필드 (선택적)
                            // 순환 참조나 데이터 크기 문제를 피하기 위해 요약 정보만 포함하거나 ID만 포함할 수 있음.
                            // 여기서는 일단 생략하고, 필요시 추가.
                            // pub novel: Option<SlimNovelDataForEpisodeContext>,
}

// --- Rust invoke 함수 호출 시 사용될 옵션 및 데이터 타입들 ---
// TypeScript의 CreateLocalNovelOptions에 대응
#[derive(Deserialize, Debug)]
pub struct CreateLocalNovelOptions {
    pub title: String,
    #[serde(rename = "targetDirectoryPath")]
    pub target_directory_path: String,
}

// TypeScript의 UpdateLocalNovelData에 대응
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

// TypeScript의 CreateLocalEpisodeOptions에 대응
#[derive(Deserialize, Debug)]
pub struct CreateLocalEpisodeOptions {
    #[serde(rename = "novelId")]
    pub novel_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(rename = "episodeType")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub episode_type: Option<EpisodeType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<i32>,
}

// TypeScript의 UpdateLocalEpisodeMetadata에 대응
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
    pub order: Option<i32>,
}

// TypeScript의 UpdateLocalEpisodeBlocksData에 대응 (Block 구조체 배열)
pub type UpdateLocalEpisodeBlocksData = Vec<Block>;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct LocalNovelDataEpisodesSummary {
    pub id: String,
    pub title: String,
    pub order: i32,
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
