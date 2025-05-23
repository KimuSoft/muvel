use serde::{Deserialize, Serialize};

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
