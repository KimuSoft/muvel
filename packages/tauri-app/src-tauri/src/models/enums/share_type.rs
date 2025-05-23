use serde_repr::{Deserialize_repr, Serialize_repr};

#[derive(Serialize_repr, Deserialize_repr, Debug, Clone, PartialEq)]
#[repr(u8)]
pub enum ShareType {
    Private = 0,
    Unlisted = 1,
    Public = 2,
    Local = 3, // 로컬 저장용 타입
}
