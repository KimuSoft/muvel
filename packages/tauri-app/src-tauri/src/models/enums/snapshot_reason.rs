use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "camelCase")] // TypeScript enum string values와 일치
pub enum SnapshotReason {
    Merge,
    Manual,
    Autosave,
}
