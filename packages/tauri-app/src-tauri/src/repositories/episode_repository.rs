use chrono::Utc;
use std::path::PathBuf;
use tauri::AppHandle;
use uuid::Uuid;

use crate::models::block::DeltaBlock;
use crate::models::enums::episode_type::EpisodeType;
use crate::models::episode::{
    CreateLocalEpisodeOptions, EpisodeMetadataUpdatePayload, EpisodeParentNovelContext,
    LocalEpisodeData, LocalEpisodeDataResponse, UpdateLocalEpisodeMetadata,
};
use crate::models::novel::EpisodeSummaryData;
// models/novel.rs로 이동된 타입들
use crate::storage::{episode_io, index_manager, item_index_manager, novel_io};
use crate::utils::delta_block_utils;

pub struct EpisodeRepository<'a> {
    app_handle: &'a AppHandle,
}

impl<'a> EpisodeRepository<'a> {
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
                        "아이템 인덱스에서 ID {} 의 부모 소설 정보를 찾을 수 없습니다.",
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

    pub fn create_episode(
        &self,
        novel_id_str: &str,
        options: CreateLocalEpisodeOptions,
    ) -> Result<LocalEpisodeDataResponse, String> {
        let (novel_root_path, novel_id) = self.get_novel_root_path_and_id(novel_id_str, true)?;
        let (parent_novel_meta, _) = novel_io::read_novel_metadata_with_path(&novel_root_path)?;

        let episode_id = Uuid::new_v4().to_string();
        let current_time_iso = Utc::now().to_rfc3339();
        let existing_episodes = episode_io::list_episode_summaries_from_files(&novel_root_path)?;
        let new_order: f32 = options.order.unwrap_or_else(|| {
            existing_episodes
                .iter()
                .map(|e| e.order)
                .fold(0.0_f32, |max_ord, current_ord| {
                    if current_ord > max_ord {
                        current_ord
                    } else {
                        max_ord
                    }
                })
                + 1.0
        });

        let episode_data_for_file = LocalEpisodeData {
            id: episode_id.clone(),
            novel_id: novel_id.clone(),
            title: options
                .title
                .unwrap_or_else(|| format!("새 에피소드 {}", new_order.round())),
            description: options.description.unwrap_or_default(),
            author_comment: None,
            content_length: 0, // 초기 contentLength는 0
            ai_rating: None,
            episode_type: options.episode_type.unwrap_or(EpisodeType::Episode),
            order: new_order,
            flow_doc: None,
            created_at: current_time_iso.clone(),
            updated_at: current_time_iso.clone(),
            blocks: Vec::new(),
        };

        episode_io::write_episode_content(&novel_root_path, &episode_id, &episode_data_for_file)?;
        item_index_manager::upsert_item_novel_mapping(
            self.app_handle,
            episode_id.clone(),
            novel_id.clone(),
            "episode".to_string(),
        )?;
        self.update_novel_episode_count_and_timestamp(&novel_root_path, &novel_id)?;

        Ok(LocalEpisodeDataResponse {
            id: episode_data_for_file.id,
            novel_id: episode_data_for_file.novel_id,
            title: episode_data_for_file.title,
            description: episode_data_for_file.description,
            author_comment: episode_data_for_file.author_comment,
            content_length: episode_data_for_file.content_length,
            ai_rating: episode_data_for_file.ai_rating,
            episode_type: episode_data_for_file.episode_type,
            order: episode_data_for_file.order,
            flow_doc: episode_data_for_file.flow_doc,
            created_at: episode_data_for_file.created_at,
            updated_at: episode_data_for_file.updated_at,
            blocks: episode_data_for_file.blocks,
            novel: EpisodeParentNovelContext {
                id: novel_id,
                share: parent_novel_meta.share,
                title: Some(parent_novel_meta.title),
            },
        })
    }

    pub fn get_episode_data(&self, episode_id: &str) -> Result<LocalEpisodeDataResponse, String> {
        let (novel_root_path, novel_id) = self.get_novel_root_path_and_id(episode_id, false)?;
        let (parent_novel_meta, _) = novel_io::read_novel_metadata_with_path(&novel_root_path)?;
        let episode_data_core = episode_io::read_episode_content(&novel_root_path, episode_id)?;
        Ok(LocalEpisodeDataResponse {
            id: episode_data_core.id,
            novel_id: novel_id.clone(),
            title: episode_data_core.title,
            description: episode_data_core.description,
            author_comment: episode_data_core.author_comment,
            content_length: episode_data_core.content_length,
            ai_rating: episode_data_core.ai_rating,
            episode_type: episode_data_core.episode_type,
            order: episode_data_core.order,
            flow_doc: episode_data_core.flow_doc,
            created_at: episode_data_core.created_at,
            updated_at: episode_data_core.updated_at,
            blocks: episode_data_core.blocks,
            novel: EpisodeParentNovelContext {
                id: novel_id,
                share: parent_novel_meta.share,
                title: Some(parent_novel_meta.title),
            },
        })
    }

    pub fn update_episode_metadata(
        &self,
        episode_id: &str,
        metadata_update: UpdateLocalEpisodeMetadata,
    ) -> Result<EpisodeSummaryData, String> {
        let (novel_root_path, novel_id) = self.get_novel_root_path_and_id(episode_id, false)?;
        let mut episode_data = episode_io::read_episode_content(&novel_root_path, episode_id)?;
        let mut changed = false;
        if let Some(title) = metadata_update.title {
            if episode_data.title != title {
                episode_data.title = title;
                changed = true;
            }
        }
        if let Some(description) = metadata_update.description {
            if episode_data.description != description {
                episode_data.description = description;
                changed = true;
            }
        }
        if metadata_update.author_comment.is_some()
            && episode_data.author_comment != metadata_update.author_comment
        {
            episode_data.author_comment = metadata_update.author_comment;
            changed = true;
        }
        if let Some(ep_type) = metadata_update.episode_type {
            if episode_data.episode_type != ep_type {
                episode_data.episode_type = ep_type;
                changed = true;
            }
        }
        if let Some(order_val) = metadata_update.order {
            if (episode_data.order - order_val).abs() > f32::EPSILON {
                episode_data.order = order_val;
                changed = true;
            }
        }
        if metadata_update.ai_rating.is_some()
            && episode_data.ai_rating != metadata_update.ai_rating
        {
            episode_data.ai_rating = metadata_update.ai_rating;
            changed = true;
        }

        if changed {
            episode_data.updated_at = Utc::now().to_rfc3339();
            episode_io::write_episode_content(&novel_root_path, episode_id, &episode_data)?;
            self.update_novel_timestamp_only(&novel_root_path, &novel_id)?;
        }
        Ok(EpisodeSummaryData {
            id: episode_data.id,
            title: episode_data.title,
            order: episode_data.order,
            episode_type: episode_data.episode_type,
            content_length: Some(episode_data.content_length),
            created_at: episode_data.created_at,
            updated_at: episode_data.updated_at,
        })
    }

    pub fn batch_update_episode_metadata(
        &self,
        diffs: Vec<EpisodeMetadataUpdatePayload>,
    ) -> Result<Vec<EpisodeSummaryData>, String> {
        let mut updated_summaries = Vec::new();
        let mut affected_novel_ids = std::collections::HashSet::new();

        for diff_item in diffs {
            let update_data = UpdateLocalEpisodeMetadata {
                title: diff_item.title.clone(),
                description: None,
                author_comment: None,
                episode_type: diff_item.episode_type.clone(),
                order: diff_item.order,
                ai_rating: None,
            };

            match self.update_episode_metadata(&diff_item.id, update_data) {
                Ok(summary) => {
                    updated_summaries.push(summary);
                    if let Ok(Some(entry)) =
                        item_index_manager::get_item_entry(self.app_handle, &diff_item.id)
                    {
                        affected_novel_ids.insert(entry.novel_id);
                    }
                }
                Err(e) => {
                    return Err(format!(
                        "에피소드 ID {} 일괄 업데이트 중 오류: {}",
                        diff_item.id, e
                    ));
                }
            }
        }

        for novel_id in affected_novel_ids {
            if let Ok((novel_root_path, _)) = self.get_novel_root_path_and_id(&novel_id, true) {
                self.update_novel_timestamp_only(&novel_root_path, &novel_id)?;
            }
        }
        Ok(updated_summaries)
    }

    pub fn delete_episode(&self, episode_id: &str) -> Result<(), String> {
        let (novel_root_path, novel_id) = self.get_novel_root_path_and_id(episode_id, false)?;
        episode_io::delete_episode_file(&novel_root_path, episode_id)?;
        item_index_manager::remove_item_novel_mapping(self.app_handle, episode_id)?;
        self.update_novel_episode_count_and_timestamp(&novel_root_path, &novel_id)?;
        Ok(())
    }

    pub fn list_episode_summaries_for_novel(
        &self,
        novel_id_str: &str,
    ) -> Result<Vec<EpisodeSummaryData>, String> {
        let (novel_root_path, _novel_id) = self.get_novel_root_path_and_id(novel_id_str, true)?;
        episode_io::list_episode_summaries_from_files(&novel_root_path)
    }

    pub fn sync_delta_blocks(
        &self,
        episode_id: &str,
        delta_blocks: Vec<DeltaBlock>,
    ) -> Result<(), String> {
        let (novel_root_path, novel_id) = self.get_novel_root_path_and_id(episode_id, false)?;
        let mut episode_data = episode_io::read_episode_content(&novel_root_path, episode_id)?;

        let merged_blocks =
            delta_block_utils::merge_delta_blocks(episode_data.blocks, delta_blocks)?;

        episode_data.blocks = merged_blocks;
        episode_data.updated_at = Utc::now().to_rfc3339();

        // contentLength 계산 로직 수정: 공백 제외 글자 수 합산
        let calculated_content_length: usize = episode_data
            .blocks
            .iter()
            .map(|block| block.text.chars().filter(|c| !c.is_whitespace()).count())
            .sum();
        episode_data.content_length = calculated_content_length as i32;

        episode_io::write_episode_content(&novel_root_path, episode_id, &episode_data)?;
        self.update_novel_timestamp_only(&novel_root_path, &novel_id)?; // 부모 소설 타임스탬프만 업데이트

        // 부모 소설의 .muvl 파일 내 에피소드 요약 정보도 업데이트 (선택적이지만, 정합성을 위해 권장)
        // 이 부분은 현재 EpisodeSummaryData에는 contentLength가 Option이므로,
        // novel_io를 직접 호출하여 .muvl 파일의 해당 에피소드 요약 정보를 수정해야 합니다.
        // 또는, NovelRepository에 관련 기능을 만들고 호출할 수 있습니다.
        // 여기서는 간단히 부모 소설의 updated_at만 갱신하는 것으로 유지합니다.
        // 만약 .muvl 내 요약 정보 업데이트가 필요하면, 아래와 유사한 로직 추가:
        /*
        let (mut parent_novel_data, _) = novel_io::read_novel_metadata_with_path(&novel_root_path)?;
        if let Some(episodes_summary_vec) = parent_novel_data.episodes.as_mut() { // Novel 모델에 episodes 필드가 있다면
            if let Some(summary_to_update) = episodes_summary_vec.iter_mut().find(|s| s.id == episode_id) {
                summary_to_update.content_length = Some(episode_data.content_length);
                summary_to_update.updated_at = episode_data.updated_at.clone();
                parent_novel_data.updated_at = episode_data.updated_at.clone(); // 소설 전체 업데이트 시간도 갱신
                novel_io::update_existing_novel_metadata_file(&novel_root_path, &parent_novel_data)?;
            }
        }
        */
        Ok(())
    }

    fn update_novel_episode_count_and_timestamp(
        &self,
        novel_root_path: &PathBuf,
        novel_id: &str,
    ) -> Result<(), String> {
        let (mut novel_data, _) = novel_io::read_novel_metadata_with_path(novel_root_path)?;
        let episode_summaries = episode_io::list_episode_summaries_from_files(novel_root_path)?;
        let new_count = episode_summaries.len() as i32;
        let current_time = Utc::now().to_rfc3339();
        let mut changed = false;
        if novel_data.episode_count != Some(new_count) {
            novel_data.episode_count = Some(new_count);
            changed = true;
        }
        if novel_data.updated_at < current_time {
            novel_data.updated_at = current_time.clone();
            changed = true;
        }

        if changed {
            novel_io::update_existing_novel_metadata_file(novel_root_path, &novel_data)?;
            if let Some(mut entry) = index_manager::get_novel_entry(self.app_handle, novel_id)? {
                if entry.episode_count != Some(new_count) {
                    entry.episode_count = Some(new_count);
                    index_manager::upsert_novel_entry(
                        self.app_handle,
                        novel_id.to_string(),
                        entry,
                    )?;
                }
            }
        }
        Ok(())
    }

    fn update_novel_timestamp_only(
        &self,
        novel_root_path: &PathBuf,
        _novel_id: &str,
    ) -> Result<(), String> {
        let (mut novel_data, _) = novel_io::read_novel_metadata_with_path(novel_root_path)?;
        let current_time = Utc::now().to_rfc3339();
        if novel_data.updated_at < current_time {
            novel_data.updated_at = current_time;
            novel_io::update_existing_novel_metadata_file(novel_root_path, &novel_data)?;
        }
        Ok(())
    }
}
