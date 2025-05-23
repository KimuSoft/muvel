use serde::{Deserialize, Serialize};

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

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum DeltaBlockAction {
    Create,
    Update,
    Delete,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DeltaBlock {
    pub id: String,
    pub action: DeltaBlockAction,
    pub date: String, // Delta 생성 시각 (ISO 8601), 블록의 created_at/updated_at에 사용될 수 있음

    // Partial<Omit<Block, "updatedAt" | "id" | "text">>에 해당하는 필드들
    // 'text' 필드는 DeltaBlock 정의에 따라 포함되지 않음
    pub content: Option<Vec<serde_json::Value>>,
    pub block_type: Option<String>,
    pub attr: Option<serde_json::Value>, // Option<serde_json::Value> 사용, serde_json::Value::Null 가능
    pub order: Option<f32>,
}
