use chrono::Utc;
use slug::slugify;
use std::collections::HashSet;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};
use uuid::Uuid;

use crate::models::enums::share_type::ShareType;
use crate::models::index::LocalNovelIndexEntry;
use crate::models::novel::{
    CreateLocalNovelOptions, EpisodeSummaryData, Novel, NovelFullDetails, UpdateLocalNovelData,
    WikiPageSummaryData,
};
use crate::storage::{episode_io, index_manager, item_index_manager, novel_io, wiki_page_io};

pub struct NovelRepository<'a> {
    app_handle: &'a AppHandle,
}

impl<'a> NovelRepository<'a> {
    pub fn new(app_handle: &'a AppHandle) -> Self {
        Self { app_handle }
    }

    pub fn create_novel(&self, options: CreateLocalNovelOptions) -> Result<Novel, String> {
        let novel_id = Uuid::new_v4().to_string();
        let novel_folder_name = slugify(&options.title);

        let mut novel_root_path: PathBuf = if let Some(path_str) = &options.target_directory_path {
            PathBuf::from(path_str)
        } else {
            self.app_handle
                .path()
                .app_local_data_dir()
                .map_err(|e| format!("애플리케이션 로컬 데이터 디렉토리 경로 실패: {:?}", e))?
                .join("novels")
        };
        novel_root_path.push(&novel_folder_name);

        if novel_root_path.exists() {
            return Err(format!("이미 폴더가 존재합니다: {:?}", novel_root_path));
        }

        novel_io::create_novel_directories(&novel_root_path)?;
        wiki_page_io::ensure_wiki_pages_directory_exists(&novel_root_path)?;

        let current_time_iso = Utc::now().to_rfc3339();
        let initial_novel_data = Novel {
            id: novel_id.clone(),
            title: options.title.clone(),
            description: None,
            tags: Some(Vec::new()),
            episode_count: Some(0),
            thumbnail: None,
            share: ShareType::Local,
            created_at: current_time_iso.clone(),
            updated_at: current_time_iso.clone(),
            local_path: novel_root_path.to_string_lossy().into_owned(),
        };

        // 생성 시에는 폴더명 기반으로 새 파일 저장
        novel_io::write_novel_metadata_for_creation(&novel_root_path, &initial_novel_data)?;

        let index_entry = LocalNovelIndexEntry {
            id: novel_id.clone(),
            title: options.title.clone(),
            path: Some(novel_root_path.to_string_lossy().into_owned()),
            episode_count: Some(0),
            thumbnail: None,
            last_opened: Some(current_time_iso),
        };
        index_manager::upsert_novel_entry(self.app_handle, novel_id.clone(), index_entry)?;
        Ok(initial_novel_data)
    }

    pub fn get_novel_details(&self, novel_id: &str) -> Result<NovelFullDetails, String> {
        let novel_entry = index_manager::get_novel_entry(self.app_handle, novel_id)?
            .ok_or_else(|| format!("인덱스에서 소설 ID {} 를 찾을 수 없습니다.", novel_id))?;
        let novel_root_path = PathBuf::from(novel_entry.path.ok_or("소설 경로 없음")?);

        if !novel_root_path.exists() || !novel_root_path.is_dir() {
            eprintln!("경고: 소설 ID {}의 경로 {:?}가 존재하지 않거나 디렉토리가 아닙니다. 인덱스에서 제거합니다.", novel_id, novel_root_path);
            index_manager::remove_novel_entry(self.app_handle, novel_id)?;
            let episode_ids = item_index_manager::get_item_ids_for_novel_by_type(
                self.app_handle,
                novel_id,
                "episode",
            )
            .unwrap_or_default();
            for ep_id in episode_ids {
                item_index_manager::remove_item_novel_mapping(self.app_handle, &ep_id)?;
            }
            let wiki_page_ids = item_index_manager::get_item_ids_for_novel_by_type(
                self.app_handle,
                novel_id,
                "wiki_page",
            )
            .unwrap_or_default();
            for page_id in wiki_page_ids {
                item_index_manager::remove_item_novel_mapping(self.app_handle, &page_id)?;
            }
            return Err(format!(
                "소설 ID {}의 프로젝트 경로를 찾을 수 없습니다: {:?}",
                novel_id, novel_root_path
            ));
        }

        // read_novel_metadata_with_path 사용 (실제 읽은 파일 경로도 반환하지만 여기서는 novel_data만 사용)
        let (mut novel_metadata, _actual_muvl_path) =
            novel_io::read_novel_metadata_with_path(&novel_root_path)?;

        if novel_metadata.local_path != novel_root_path.to_string_lossy() {
            novel_metadata.local_path = novel_root_path.to_string_lossy().into_owned();
            // 변경된 local_path를 저장하기 위해 update_existing_novel_metadata_file 호출
            novel_io::update_existing_novel_metadata_file(&novel_root_path, &novel_metadata)?;
        }

        let episode_summaries = episode_io::list_episode_summaries_from_files(&novel_root_path)?;
        let wiki_page_summaries =
            wiki_page_io::list_wiki_page_summaries_from_files(&novel_root_path)?;

        self.ensure_novel_data_synced(
            novel_id,
            &novel_root_path,
            &episode_summaries,
            &wiki_page_summaries,
            &mut novel_metadata,
        )?;

        if let Some(mut entry_to_update) =
            index_manager::get_novel_entry(self.app_handle, novel_id)?
        {
            let current_time_str = Utc::now().to_rfc3339();
            if entry_to_update.last_opened.as_deref() != Some(current_time_str.as_str()) {
                entry_to_update.last_opened = Some(current_time_str);
                index_manager::upsert_novel_entry(
                    self.app_handle,
                    novel_id.to_string(),
                    entry_to_update,
                )?;
            }
        }

        Ok(NovelFullDetails {
            novel: novel_metadata,
            episodes: episode_summaries,
            wiki_pages: wiki_page_summaries,
        })
    }

    pub fn update_novel_metadata(
        &self,
        novel_id: &str,
        data: UpdateLocalNovelData,
    ) -> Result<NovelFullDetails, String> {
        let novel_root_path = self.get_novel_root_path(novel_id)?;
        let (mut current_novel_data, _actual_muvl_path) =
            novel_io::read_novel_metadata_with_path(&novel_root_path)?;
        let mut changed = false;

        if let Some(title) = data.title {
            if current_novel_data.title != title {
                current_novel_data.title = title;
                changed = true;
            }
        }
        if data.description.is_some() && current_novel_data.description != data.description {
            current_novel_data.description = data.description;
            changed = true;
        }
        if data.tags.is_some() && current_novel_data.tags != data.tags {
            current_novel_data.tags = data.tags;
            changed = true;
        }
        if data.thumbnail.is_some() && current_novel_data.thumbnail != data.thumbnail {
            current_novel_data.thumbnail = data.thumbnail;
            changed = true;
        }

        if changed {
            current_novel_data.updated_at = Utc::now().to_rfc3339();
            // 업데이트 시에는 현재 존재하는 .muvl 파일에 덮어쓰기
            novel_io::update_existing_novel_metadata_file(&novel_root_path, &current_novel_data)?;

            if let Some(mut entry_to_update) =
                index_manager::get_novel_entry(self.app_handle, novel_id)?
            {
                let mut index_changed = false;
                if entry_to_update.title != current_novel_data.title {
                    entry_to_update.title = current_novel_data.title.clone();
                    index_changed = true;
                }
                if entry_to_update.thumbnail != current_novel_data.thumbnail {
                    entry_to_update.thumbnail = current_novel_data.thumbnail.clone();
                    index_changed = true;
                }
                if index_changed {
                    index_manager::upsert_novel_entry(
                        self.app_handle,
                        novel_id.to_string(),
                        entry_to_update,
                    )?;
                }
            }
        }
        self.get_novel_details(novel_id)
    }

    // delete_novel_project, get_novel_root_path, list_all_novel_entries, get_novel_entry, register_novel_from_path, save_image_to_novel는 이전과 동일
    // ensure_novel_data_synced 내부에서 novel_metadata 변경 후 저장 시 update_existing_novel_metadata_file 사용
    pub fn delete_novel_project(&self, novel_id: &str) -> Result<(), String> {
        let novel_entry_opt = index_manager::get_novel_entry(self.app_handle, novel_id)?;
        if novel_entry_opt.is_none() {
            eprintln!(
                "경고: 삭제하려는 소설 ID {}가 이미 인덱스에 없습니다.",
                novel_id
            );
            return Ok(());
        }
        let novel_entry = novel_entry_opt.unwrap();

        if let Some(novel_root_path_str) = novel_entry.path {
            let novel_root_path = PathBuf::from(novel_root_path_str);
            novel_io::delete_novel_project_directory(&novel_root_path)?;
        } else {
            eprintln!("경고: 소설 ID {}의 경로가 인덱스에 없어 파일 시스템 삭제를 건너<0xEB><0><0x88>니다.", novel_id);
        }

        let episode_ids = item_index_manager::get_item_ids_for_novel_by_type(
            self.app_handle,
            novel_id,
            "episode",
        )
        .unwrap_or_default();
        for ep_id in episode_ids {
            item_index_manager::remove_item_novel_mapping(self.app_handle, &ep_id)?;
        }
        let wiki_page_ids = item_index_manager::get_item_ids_for_novel_by_type(
            self.app_handle,
            novel_id,
            "wiki_page",
        )
        .unwrap_or_default();
        for page_id in wiki_page_ids {
            item_index_manager::remove_item_novel_mapping(self.app_handle, &page_id)?;
        }

        index_manager::remove_novel_entry(self.app_handle, novel_id)?;
        Ok(())
    }

    pub fn get_novel_root_path(&self, novel_id: &str) -> Result<PathBuf, String> {
        let novel_entry = index_manager::get_novel_entry(self.app_handle, novel_id)?
            .ok_or_else(|| format!("인덱스에서 소설 ID {} 를 찾을 수 없습니다.", novel_id))?;

        let path_str = novel_entry.path.ok_or_else(|| {
            format!(
                "소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.",
                novel_id
            )
        })?;

        let path = PathBuf::from(path_str);
        if !path.exists() || !path.is_dir() {
            eprintln!(
                "경고: 소설 ID {}의 인덱스 경로 {:?}가 유효하지 않습니다. 인덱스에서 제거합니다.",
                novel_id, path
            );
            index_manager::remove_novel_entry(self.app_handle, novel_id)?;
            let episode_ids = item_index_manager::get_item_ids_for_novel_by_type(
                self.app_handle,
                novel_id,
                "episode",
            )
            .unwrap_or_default();
            for ep_id in episode_ids {
                item_index_manager::remove_item_novel_mapping(self.app_handle, &ep_id)?;
            }
            let wiki_page_ids = item_index_manager::get_item_ids_for_novel_by_type(
                self.app_handle,
                novel_id,
                "wiki_page",
            )
            .unwrap_or_default();
            for page_id in wiki_page_ids {
                item_index_manager::remove_item_novel_mapping(self.app_handle, &page_id)?;
            }
            return Err(format!(
                "소설 ID {}의 프로젝트 경로를 찾을 수 없습니다 (인덱스 수정됨): {:?}",
                novel_id, path
            ));
        }
        Ok(path)
    }

    pub fn list_all_novel_entries(&self) -> Result<Vec<LocalNovelIndexEntry>, String> {
        let all_entries = index_manager::get_all_novel_entries(self.app_handle)?;
        let mut valid_entries = Vec::new();
        let mut index_modified_in_listing = false; // 변경 여부 플래그

        for entry in all_entries {
            let mut current_entry_valid = true;
            if let Some(path_str) = &entry.path {
                let path = Path::new(path_str);
                if path.exists() && path.is_dir() {
                    if novel_io::read_novel_metadata_with_path(&path).is_err() {
                        // read_novel_metadata_with_path 사용
                        eprintln!("경고: 소설 ID {} (경로: {:?})의 메타데이터 파일을 읽을 수 없습니다. 인덱스에서 제거합니다.", entry.id, path);
                        current_entry_valid = false;
                    }
                } else {
                    eprintln!("경고: 인덱스 항목 소설 ID {}의 경로 {:?}가 존재하지 않거나 디렉토리가 아닙니다. 인덱스에서 제거합니다.", entry.id, path);
                    current_entry_valid = false;
                }
            } else {
                eprintln!(
                    "경고: 인덱스 항목 소설 ID {}에 경로 정보가 없습니다. 인덱스에서 제거합니다.",
                    entry.id
                );
                current_entry_valid = false;
            }

            if current_entry_valid {
                valid_entries.push(entry);
            } else {
                if index_manager::remove_novel_entry(self.app_handle, &entry.id).is_ok() {
                    index_modified_in_listing = true;
                    let episode_ids = item_index_manager::get_item_ids_for_novel_by_type(
                        self.app_handle,
                        &entry.id,
                        "episode",
                    )
                    .unwrap_or_default();
                    for ep_id in episode_ids {
                        item_index_manager::remove_item_novel_mapping(self.app_handle, &ep_id)?;
                    }
                    let wiki_page_ids = item_index_manager::get_item_ids_for_novel_by_type(
                        self.app_handle,
                        &entry.id,
                        "wiki_page",
                    )
                    .unwrap_or_default();
                    for page_id in wiki_page_ids {
                        item_index_manager::remove_item_novel_mapping(self.app_handle, &page_id)?;
                    }
                }
            }
        }
        if index_modified_in_listing {
            eprintln!("유효하지 않은 인덱스 항목이 정리되었습니다 (list_all_novel_entries).");
        }
        Ok(valid_entries)
    }

    pub fn get_novel_entry(&self, novel_id: &str) -> Result<Option<LocalNovelIndexEntry>, String> {
        let entry_opt = index_manager::get_novel_entry(self.app_handle, novel_id)?;
        if let Some(entry) = &entry_opt {
            if let Some(path_str) = &entry.path {
                let path = Path::new(path_str);
                if !path.exists()
                    || !path.is_dir()
                    || novel_io::read_novel_metadata_with_path(&path).is_err()
                {
                    eprintln!("경고: 소설 ID {}의 인덱스 경로 {:?}가 유효하지 않거나 메타데이터를 읽을 수 없습니다. get_novel_entry 호출 시 인덱스에서 제거합니다.", novel_id, path);
                    index_manager::remove_novel_entry(self.app_handle, novel_id)?;
                    let episode_ids = item_index_manager::get_item_ids_for_novel_by_type(
                        self.app_handle,
                        novel_id,
                        "episode",
                    )
                    .unwrap_or_default();
                    for ep_id in episode_ids {
                        item_index_manager::remove_item_novel_mapping(self.app_handle, &ep_id)?;
                    }
                    let wiki_page_ids = item_index_manager::get_item_ids_for_novel_by_type(
                        self.app_handle,
                        novel_id,
                        "wiki_page",
                    )
                    .unwrap_or_default();
                    for page_id in wiki_page_ids {
                        item_index_manager::remove_item_novel_mapping(self.app_handle, &page_id)?;
                    }
                    return Ok(None);
                }
            } else {
                eprintln!("경고: 소설 ID {}에 경로 정보가 없습니다. get_novel_entry 호출 시 인덱스에서 제거합니다.", novel_id);
                index_manager::remove_novel_entry(self.app_handle, novel_id)?;
                let episode_ids = item_index_manager::get_item_ids_for_novel_by_type(
                    self.app_handle,
                    novel_id,
                    "episode",
                )
                .unwrap_or_default();
                for ep_id in episode_ids {
                    item_index_manager::remove_item_novel_mapping(self.app_handle, &ep_id)?;
                }
                let wiki_page_ids = item_index_manager::get_item_ids_for_novel_by_type(
                    self.app_handle,
                    novel_id,
                    "wiki_page",
                )
                .unwrap_or_default();
                for page_id in wiki_page_ids {
                    item_index_manager::remove_item_novel_mapping(self.app_handle, &page_id)?;
                }
                return Ok(None);
            }
        }
        Ok(entry_opt)
    }

    pub fn register_novel_from_path(&self, file_path_str: &str) -> Result<Option<String>, String> {
        let file_path = Path::new(file_path_str);
        if !file_path.exists()
            || !file_path.is_file()
            || file_path.extension().map_or(true, |ext| ext != "muvl")
        {
            return Err("유효한 .muvl 파일 경로가 아닙니다.".to_string());
        }
        let novel_root_path = file_path
            .parent()
            .ok_or("소설 루트 경로를 찾을 수 없습니다.")?;
        // read_novel_metadata_with_path 사용
        let (novel_data, _actual_muvl_path) =
            novel_io::read_novel_metadata_with_path(&novel_root_path)?;
        let episode_summaries = episode_io::list_episode_summaries_from_files(&novel_root_path)?;
        let actual_episode_count = episode_summaries.len() as i32;

        let entry = LocalNovelIndexEntry {
            id: novel_data.id.clone(),
            title: novel_data.title.clone(),
            path: Some(novel_root_path.to_string_lossy().into_owned()),
            episode_count: Some(actual_episode_count),
            thumbnail: novel_data.thumbnail.clone(),
            last_opened: Some(Utc::now().to_rfc3339()),
        };
        index_manager::upsert_novel_entry(self.app_handle, novel_data.id.clone(), entry)?;

        if novel_data.episode_count != Some(actual_episode_count) {
            let mut mutable_novel_data = novel_data.clone();
            mutable_novel_data.episode_count = Some(actual_episode_count);
            mutable_novel_data.updated_at = Utc::now().to_rfc3339();
            // 업데이트 시에는 현재 존재하는 .muvl 파일에 덮어쓰기
            novel_io::update_existing_novel_metadata_file(&novel_root_path, &mutable_novel_data)?;
        }
        Ok(Some(novel_data.id))
    }

    fn ensure_novel_data_synced(
        &self,
        novel_id: &str,
        novel_root_path: &Path,
        fs_episode_summaries: &[EpisodeSummaryData],
        fs_wiki_page_summaries: &[WikiPageSummaryData],
        novel_metadata: &mut Novel,
    ) -> Result<(), String> {
        let indexed_episode_ids_vec = item_index_manager::get_item_ids_for_novel_by_type(
            self.app_handle,
            novel_id,
            "episode",
        )
        .unwrap_or_default();
        let indexed_episode_ids_set: HashSet<String> =
            indexed_episode_ids_vec.into_iter().collect();
        let fs_episode_ids_set: HashSet<String> =
            fs_episode_summaries.iter().map(|s| s.id.clone()).collect();

        for fs_summary in fs_episode_summaries {
            if !indexed_episode_ids_set.contains(&fs_summary.id) {
                item_index_manager::upsert_item_novel_mapping(
                    self.app_handle,
                    fs_summary.id.clone(),
                    novel_id.to_string(),
                    "episode".to_string(),
                )?;
            }
        }
        for indexed_id in &indexed_episode_ids_set {
            if !fs_episode_ids_set.contains(indexed_id) {
                item_index_manager::remove_item_novel_mapping(self.app_handle, indexed_id)?;
            }
        }

        let indexed_wiki_ids_vec = item_index_manager::get_item_ids_for_novel_by_type(
            self.app_handle,
            novel_id,
            "wiki_page",
        )
        .unwrap_or_default();
        let indexed_wiki_ids_set: HashSet<String> = indexed_wiki_ids_vec.into_iter().collect();
        let fs_wiki_ids_set: HashSet<String> = fs_wiki_page_summaries
            .iter()
            .map(|s| s.id.clone())
            .collect();

        for fs_summary in fs_wiki_page_summaries {
            if !indexed_wiki_ids_set.contains(&fs_summary.id) {
                item_index_manager::upsert_item_novel_mapping(
                    self.app_handle,
                    fs_summary.id.clone(),
                    novel_id.to_string(),
                    "wiki_page".to_string(),
                )?;
            }
        }
        for indexed_id in &indexed_wiki_ids_set {
            if !fs_wiki_ids_set.contains(indexed_id) {
                item_index_manager::remove_item_novel_mapping(self.app_handle, indexed_id)?;
            }
        }

        let actual_episode_count = fs_episode_summaries.len() as i32;
        let mut novel_meta_changed = false;
        if novel_metadata.episode_count != Some(actual_episode_count) {
            novel_metadata.episode_count = Some(actual_episode_count);
            novel_meta_changed = true;
        }

        if novel_meta_changed {
            novel_metadata.updated_at = Utc::now().to_rfc3339();
            // 업데이트 시에는 현재 존재하는 .muvl 파일에 덮어쓰기
            novel_io::update_existing_novel_metadata_file(novel_root_path, novel_metadata)?;
        }

        if let Some(mut entry_to_update) =
            index_manager::get_novel_entry(self.app_handle, novel_id)?
        {
            if entry_to_update.episode_count != Some(actual_episode_count) {
                entry_to_update.episode_count = Some(actual_episode_count);
                index_manager::upsert_novel_entry(
                    self.app_handle,
                    novel_id.to_string(),
                    entry_to_update,
                )?;
            }
        }
        Ok(())
    }

    pub fn save_image_to_novel(
        &self,
        novel_id: &str,
        original_file_name: &str,
        file_bytes: Vec<u8>,
    ) -> Result<String, String> {
        let novel_root_path = self.get_novel_root_path(novel_id)?;
        novel_io::save_image_to_resources(&novel_root_path, original_file_name, file_bytes)
    }
}
