use serde::{Deserialize, Serialize};

// BlockAttrs: Record<string, string | number>
// Rust에서는 serde_json::Value를 사용하여 유연하게 처리하거나,
// 필요시 string과 number를 모두 담을 수 있는 enum을 사용할 수 있습니다.
// 여기서는 기존처럼 attr: Option<serde_json::Value>를 사용합니다.
// 만약 BlockAttrs가 항상 HashMap<String, ValueFromStringOrNumber> 형태라면 그렇게 정의할 수도 있습니다.
// 예: pub type BlockAttrs = HashMap<String, serde_json::Value>;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Block {
    // TypeScript의 BaseBlock<BType>에 해당
    pub id: String,
    pub text: String,                    // 블록의 순수 텍스트 내용 (검색 등 활용)
    pub content: Vec<serde_json::Value>, // PMNodeJSON[] ProseMirror 노드 JSON 배열
    #[serde(rename = "blockType")]
    pub block_type: String, // EpisodeBlockType 또는 WikiBlockType 문자열 값

    // attr: BlockAttrs | null
    // serde_json::Value는 JSON null, object, string, number 등을 모두 표현 가능
    #[serde(skip_serializing_if = "Option::is_none")]
    pub attr: Option<serde_json::Value>,

    pub order: i32,
    #[serde(rename = "updatedAt")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum DeltaBlockAction {
    Create,
    Update,
    Delete,
}

// DeltaBlock은 Partial<Omit<Block, "updatedAt" | "id" | "text">> 와 유사한 역할
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DeltaBlock {
    pub id: String,
    pub action: DeltaBlockAction,
    pub date: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<Vec<serde_json::Value>>,
    #[serde(rename = "blockType")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub block_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub attr: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<f32>, // 클라이언트에서 순서 변경 시 f32로 올 수 있음
}
