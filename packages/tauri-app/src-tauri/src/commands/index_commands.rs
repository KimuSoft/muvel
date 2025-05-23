use crate::models::index::LocalNovelIndexEntry;
use crate::repositories::novel_repository::NovelRepository;
use tauri::{command, AppHandle};

#[command]
pub fn get_all_local_novel_entries_command(
    app_handle: AppHandle,
) -> Result<Vec<LocalNovelIndexEntry>, String> {
    let repo = NovelRepository::new(&app_handle);
    repo.list_all_novel_entries()
}

#[command]
pub fn get_local_novel_entry_command(
    app_handle: AppHandle,
    novel_id: String,
) -> Result<Option<LocalNovelIndexEntry>, String> {
    let repo = NovelRepository::new(&app_handle);
    repo.get_novel_entry(&novel_id)
}

#[command]
pub fn register_novel_from_path_command(
    app_handle: AppHandle,
    file_path: String,
) -> Result<Option<String>, String> {
    let repo = NovelRepository::new(&app_handle);
    repo.register_novel_from_path(&file_path)
}
