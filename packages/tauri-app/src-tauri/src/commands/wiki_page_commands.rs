use crate::models::novel::WikiPageSummaryData;
use crate::models::wiki_page::{CreateWikiPageOptions, UpdateWikiPageData, WikiPage};
use crate::repositories::wiki_page_repository::WikiPageRepository;
use tauri::{command, AppHandle};

#[command]
pub fn create_wiki_page_command(
    app_handle: AppHandle,
    novel_id: String,
    options: CreateWikiPageOptions,
) -> Result<WikiPage, String> {
    let repo = WikiPageRepository::new(&app_handle);
    repo.create_wiki_page(&novel_id, options)
}

#[command]
pub fn get_wiki_page_command(app_handle: AppHandle, page_id: String) -> Result<WikiPage, String> {
    let repo = WikiPageRepository::new(&app_handle);
    repo.get_wiki_page(&page_id)
}

#[command]
pub fn update_wiki_page_command(
    app_handle: AppHandle,
    page_id: String,
    data: UpdateWikiPageData,
) -> Result<WikiPage, String> {
    let repo = WikiPageRepository::new(&app_handle);
    repo.update_wiki_page(&page_id, data)
}

#[command]
pub fn delete_wiki_page_command(app_handle: AppHandle, page_id: String) -> Result<(), String> {
    let repo = WikiPageRepository::new(&app_handle);
    repo.delete_wiki_page(&page_id)
}

#[command]
pub fn list_wiki_page_summaries_command(
    app_handle: AppHandle,
    novel_id: String,
) -> Result<Vec<WikiPageSummaryData>, String> {
    let repo = WikiPageRepository::new(&app_handle);
    repo.list_wiki_page_summaries_for_novel(&novel_id)
}
