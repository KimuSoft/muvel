use serde_repr::{Deserialize_repr, Serialize_repr};

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
