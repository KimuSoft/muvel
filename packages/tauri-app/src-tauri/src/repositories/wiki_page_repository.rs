use chrono::Utc;
use std::path::PathBuf;
use tauri::AppHandle;
use uuid::Uuid;

use crate::models::novel::WikiPageSummaryData;
use crate::models::wiki_page::{CreateWikiPageOptions, UpdateWikiPageData, WikiPage};
use crate::storage::{index_manager, item_index_manager, novel_io, wiki_page_io};

pub struct WikiPageRepository<'a> {
    app_handle: &'a AppHandle,
}

impl<'a> WikiPageRepository<'a> {
    pub fn new(app_handle: &'a AppHandle) -> Self {
        Self { app_handle }
    }

    fn get_novel_root_path_and_id(
        &self,
        id_param: &str,
        is_novel_id_param: bool,
    ) -> Result<(PathBuf, String), String> {
        let novel_id = if is_novel_id_param {
            id_param.to_string()
        } else {
            item_index_manager::get_item_entry(self.app_handle, id_param)?
                .ok_or_else(|| {
                    format!(
                        "아이템 인덱스에서 위키 페이지 ID {} 의 부모 소설 정보를 찾을 수 없습니다.",
                        id_param
                    )
                })?
                .novel_id
        };

        let novel_entry = index_manager::get_novel_entry(self.app_handle, &novel_id)?
            .ok_or_else(|| format!("소설 ID {} 를 인덱스에서 찾을 수 없습니다.", novel_id))?;
        let novel_root_path_str = novel_entry.path.ok_or_else(|| {
            format!(
                "소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.",
                novel_id
            )
        })?;

        Ok((PathBuf::from(novel_root_path_str), novel_id))
    }

    pub fn create_wiki_page(
        &self,
        novel_id_str: &str,
        options: CreateWikiPageOptions,
    ) -> Result<WikiPage, String> {
        let (novel_root_path, novel_id) = self.get_novel_root_path_and_id(novel_id_str, true)?;
        wiki_page_io::ensure_wiki_pages_directory_exists(&novel_root_path)?;

        let page_id = Uuid::new_v4().to_string();
        let current_time_iso = Utc::now().to_rfc3339();

        let wiki_page_data = WikiPage {
            id: page_id.clone(),
            title: options.title,
            summary: options.summary,
            category: options.category,
            tags: options.tags.unwrap_or_default(),
            thumbnail: options.thumbnail,
            attributes: options.attributes.unwrap_or_default(),
            blocks: Vec::new(),
            created_at: current_time_iso.clone(),
            updated_at: current_time_iso.clone(),
        };

        wiki_page_io::write_wiki_page_content(&novel_root_path, &page_id, &wiki_page_data)?;
        item_index_manager::upsert_item_novel_mapping(
            self.app_handle,
            page_id.clone(),
            novel_id.clone(),
            "wiki_page".to_string(),
        )?;

        // novel_io::read_novel_metadata_with_path 사용
        let (mut novel_data, _) = novel_io::read_novel_metadata_with_path(&novel_root_path)?;
        novel_data.updated_at = Utc::now().to_rfc3339();
        // novel_io::update_existing_novel_metadata_file 사용
        novel_io::update_existing_novel_metadata_file(&novel_root_path, &novel_data)?;
        Ok(wiki_page_data)
    }

    pub fn get_wiki_page(&self, page_id: &str) -> Result<WikiPage, String> {
        let (novel_root_path, _novel_id) = self.get_novel_root_path_and_id(page_id, false)?;
        wiki_page_io::read_wiki_page_content(&novel_root_path, page_id)
    }

    pub fn update_wiki_page(
        &self,
        page_id: &str,
        update_data: UpdateWikiPageData,
    ) -> Result<WikiPage, String> {
        let (novel_root_path, _novel_id) = self.get_novel_root_path_and_id(page_id, false)?;
        let mut page_data = wiki_page_io::read_wiki_page_content(&novel_root_path, page_id)?;
        let mut changed = false;

        if let Some(title) = update_data.title {
            if page_data.title != title {
                page_data.title = title;
                changed = true;
            }
        }
        if update_data.summary.is_some() && page_data.summary != update_data.summary {
            page_data.summary = update_data.summary;
            changed = true;
        }
        if update_data.category.is_some() && page_data.category != update_data.category {
            page_data.category = update_data.category;
            changed = true;
        }
        if let Some(tags) = update_data.tags {
            if page_data.tags != tags {
                page_data.tags = tags;
                changed = true;
            }
        }
        if update_data.thumbnail.is_some() && page_data.thumbnail != update_data.thumbnail {
            page_data.thumbnail = update_data.thumbnail;
            changed = true;
        }
        if let Some(attributes) = update_data.attributes {
            if page_data.attributes != attributes {
                page_data.attributes = attributes;
                changed = true;
            }
        }

        if changed {
            page_data.updated_at = Utc::now().to_rfc3339();
            wiki_page_io::write_wiki_page_content(&novel_root_path, page_id, &page_data)?;
            // novel_io::read_novel_metadata_with_path 사용
            let (mut novel_data, _) = novel_io::read_novel_metadata_with_path(&novel_root_path)?;
            novel_data.updated_at = Utc::now().to_rfc3339();
            // novel_io::update_existing_novel_metadata_file 사용
            novel_io::update_existing_novel_metadata_file(&novel_root_path, &novel_data)?;
        }
        Ok(page_data)
    }

    pub fn delete_wiki_page(&self, page_id: &str) -> Result<(), String> {
        let (novel_root_path, _novel_id) = self.get_novel_root_path_and_id(page_id, false)?; // novel_id는 현재 사용 안함
        wiki_page_io::delete_wiki_page_file(&novel_root_path, page_id)?;
        item_index_manager::remove_item_novel_mapping(self.app_handle, page_id)?;
        // novel_io::read_novel_metadata_with_path 사용
        let (mut novel_data, _) = novel_io::read_novel_metadata_with_path(&novel_root_path)?;
        novel_data.updated_at = Utc::now().to_rfc3339();
        novel_io::update_existing_novel_metadata_file(&novel_root_path, &novel_data)?;
        Ok(())
    }

    pub fn list_wiki_page_summaries_for_novel(
        &self,
        novel_id_str: &str,
    ) -> Result<Vec<WikiPageSummaryData>, String> {
        let (novel_root_path, _novel_id) = self.get_novel_root_path_and_id(novel_id_str, true)?;
        wiki_page_io::list_wiki_page_summaries_from_files(&novel_root_path)
    }
}
