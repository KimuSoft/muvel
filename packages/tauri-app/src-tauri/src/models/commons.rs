/// Tauri State –남아있는 이벤트 큐
#[derive(Default)]
pub struct PendingOpen(pub std::sync::Mutex<Vec<OpenedItem>>);

/// 프런트에 넘겨줄 식별자 집합
#[derive(Clone, serde::Serialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum OpenedItem {
    Novel {
        novel_id: String,
    },
    Episode {
        novel_id: String,
        episode_id: String,
    },
}
