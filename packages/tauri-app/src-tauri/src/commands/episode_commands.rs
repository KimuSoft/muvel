// src-tauri/src/app_lib/commands/episode_commands.rs

use std::path::PathBuf;
use tauri::{command, AppHandle};
use uuid::Uuid;

use crate::models::{
    CreateLocalEpisodeOptions as RustCreateLocalEpisodeOptions, EpisodeParentNovelContext,
    EpisodeType, LocalEpisodeData, LocalEpisodeDataResponse, LocalNovelDataEpisodesSummary,
    UpdateLocalEpisodeBlocksData as RustUpdateLocalEpisodeBlocksData,
    UpdateLocalEpisodeMetadata as RustUpdateLocalEpisodeMetadata,
};
use crate::storage::{episode_io, index_manager, item_index_manager, novel_io};

/// 새로운 로컬 에피소드를 생성하고, 부모 소설의 메타데이터(.muvl)도 업데이트하며,
/// 아이템-소설 ID 맵에도 등록합니다.
#[command]
pub fn create_local_episode_command(
    app_handle: AppHandle,
    novel_id: String,
    options: RustCreateLocalEpisodeOptions,
) -> Result<LocalEpisodeDataResponse, String> {
    // 반환 타입을 LocalEpisodeDataResponse로 명시
    let novel_entry = index_manager::get_novel_entry(&app_handle, &novel_id)?
        .ok_or_else(|| format!("부모 소설 ID {} 를 인덱스에서 찾을 수 없습니다.", novel_id))?;
    let novel_root_path_str = novel_entry.path.ok_or_else(|| {
        format!(
            "소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.",
            novel_id
        )
    })?;
    let novel_root_path = PathBuf::from(novel_root_path_str);

    let episode_id = Uuid::new_v4().to_string();
    let current_time_iso = chrono::Utc::now().to_rfc3339();
    let mut novel_data = novel_io::read_novel_metadata(&novel_root_path)?;

    let new_order = options.order.unwrap_or_else(|| {
        novel_data
            .episodes
            .as_ref()
            .map_or(1, |eps| eps.iter().map(|e| e.order).max().unwrap_or(0) + 1)
    });

    // 1. 파일에 저장될 순수 LocalEpisodeData 생성 (novel 컨텍스트 없음)
    let episode_data_for_file = LocalEpisodeData {
        id: episode_id.clone(),
        novel_id: novel_id.clone(),
        title: options
            .title
            .clone() // Option<String>이므로 clone 필요
            .unwrap_or_else(|| format!("새 에피소드 {}", new_order)),
        description: None,    // options에서 받을 수 있도록 models.rs 수정 가능
        author_comment: None, // options에서 받을 수 있도록 models.rs 수정 가능
        content_length: Some(0),
        episode_type: options.episode_type.clone().unwrap_or(EpisodeType::Episode), // Option<EpisodeType> clone
        order: new_order,
        flow_doc: None,
        created_at: current_time_iso.clone(),
        updated_at: current_time_iso.clone(),
        blocks: Vec::new(),
        // novel 필드는 여기에 포함하지 않음
    };

    // 2. 생성된 LocalEpisodeData를 .mvle 파일에 저장
    episode_io::write_episode_content(&novel_root_path, &episode_id, &episode_data_for_file)?;

    // 3. 부모 소설의 메타데이터(.muvl)에 새 에피소드 요약 정보 추가/업데이트
    let episode_summary_for_novel = LocalNovelDataEpisodesSummary {
        id: episode_id.clone(),
        title: episode_data_for_file.title.clone(),
        order: episode_data_for_file.order,
        episode_type: episode_data_for_file.episode_type.clone(),
        content_length: episode_data_for_file.content_length,
        created_at: episode_data_for_file.created_at.clone(),
        updated_at: episode_data_for_file.updated_at.clone(),
    };

    if let Some(ref mut episodes_summary_vec) = novel_data.episodes {
        episodes_summary_vec.push(episode_summary_for_novel);
        episodes_summary_vec.sort_by_key(|e| e.order);
    } else {
        novel_data.episodes = Some(vec![episode_summary_for_novel]);
    }
    novel_data.episode_count = Some(novel_data.episodes.as_ref().map_or(0, |e| e.len() as i32));
    novel_data.updated_at = chrono::Utc::now().to_rfc3339();
    novel_io::write_novel_metadata(&novel_root_path, &novel_data)?;

    // 4. 아이템-소설 ID 맵에 새 에피소드 등록
    item_index_manager::upsert_item_novel_mapping(
        &app_handle,
        episode_id.clone(),
        novel_id.clone(),
    )?;

    // 5. 프론트엔드에 반환할 LocalEpisodeDataResponse 생성 (novel 컨텍스트 포함)
    let response_data = LocalEpisodeDataResponse {
        id: episode_data_for_file.id,
        novel_id: episode_data_for_file.novel_id,
        title: episode_data_for_file.title,
        description: episode_data_for_file.description,
        author_comment: episode_data_for_file.author_comment,
        content_length: episode_data_for_file.content_length,
        episode_type: episode_data_for_file.episode_type,
        order: episode_data_for_file.order,
        flow_doc: episode_data_for_file.flow_doc,
        created_at: episode_data_for_file.created_at,
        updated_at: episode_data_for_file.updated_at,
        blocks: episode_data_for_file.blocks,
        novel: EpisodeParentNovelContext {
            id: novel_id.clone(), // novel_id는 이미 함수 인자로 있음
            share: novel_data.share.clone(),
            title: Some(novel_data.title.clone()),
        },
    };

    Ok(response_data)
}

/// 특정 로컬 에피소드의 전체 데이터(메타데이터 + 블록 + 부모 소설 컨텍스트)를 가져옵니다.
#[command]
pub fn get_local_episode_data_command(
    app_handle: AppHandle,
    episode_id: String,
) -> Result<LocalEpisodeDataResponse, String> {
    // 1. item_index_manager를 사용하여 episode_id로부터 부모 novel_id를 가져옵니다.
    let parent_novel_id = item_index_manager::get_novel_id_for_item(&app_handle, &episode_id)? // parent_novel_id 변수에 할당
        .ok_or_else(|| {
            format!(
                "아이템 인덱스에서 에피소드 ID {} 에 대한 부모 소설 정보를 찾을 수 없습니다.",
                episode_id
            )
        })?;

    // 2. novel_id를 사용하여 index_manager에서 소설 루트 경로를 가져옵니다.
    let novel_entry =
        index_manager::get_novel_entry(&app_handle, &parent_novel_id)?.ok_or_else(|| {
            // parent_novel_id 사용
            format!(
                "소설 ID {} 를 인덱스에서 찾을 수 없습니다 (에피소드 {} 조회 중).",
                parent_novel_id, episode_id
            )
        })?;
    let novel_root_path_str = novel_entry.path.ok_or_else(|| {
        format!(
            "소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다 (에피소드 {} 조회 중).",
            parent_novel_id, episode_id
        )
    })?;
    let novel_root_path = PathBuf::from(novel_root_path_str);

    // 3. 부모 소설의 메타데이터를 읽어 novel 컨텍스트 정보를 준비합니다.
    let parent_novel_meta = novel_io::read_novel_metadata(&novel_root_path)?;

    // 4. episode_io를 사용하여 실제 에피소드 파일(.mvle) 내용을 읽습니다.
    //    이때 read_episode_content는 LocalEpisodeData (novel 필드 없는 순수 에피소드 데이터)를 반환합니다.
    let episode_data_core = episode_io::read_episode_content(&novel_root_path, &episode_id)?;

    // 5. 최종 LocalEpisodeDataResponse 객체를 구성하면서 novel 필드를 채웁니다.
    let full_episode_data_response = LocalEpisodeDataResponse {
        id: episode_data_core.id,
        novel_id: parent_novel_id.clone(), // 찾은 부모 novel_id
        title: episode_data_core.title,
        description: episode_data_core.description,
        author_comment: episode_data_core.author_comment,
        content_length: episode_data_core.content_length,
        episode_type: episode_data_core.episode_type,
        order: episode_data_core.order,
        flow_doc: episode_data_core.flow_doc,
        created_at: episode_data_core.created_at,
        updated_at: episode_data_core.updated_at,
        blocks: episode_data_core.blocks,
        novel: EpisodeParentNovelContext {
            id: parent_novel_id.clone(), // novel_id 변수 사용
            share: parent_novel_meta.share,
            title: Some(parent_novel_meta.title),
        },
    };

    Ok(full_episode_data_response)
}

/// 특정 로컬 에피소드의 블록 내용을 업데이트합니다.
#[command]
pub fn update_local_episode_blocks_command(
    app_handle: AppHandle,
    episode_id: String,
    blocks: RustUpdateLocalEpisodeBlocksData,
) -> Result<(), String> {
    let novel_id = item_index_manager::get_novel_id_for_item(&app_handle, &episode_id)?
        .ok_or_else(|| {
            format!(
                "아이템 인덱스에서 에피소드 ID {} 에 대한 부모 소설 정보를 찾을 수 없습니다.",
                episode_id
            )
        })?;
    let novel_entry = index_manager::get_novel_entry(&app_handle, &novel_id)?
        .ok_or_else(|| format!("소설 ID {} 를 인덱스에서 찾을 수 없습니다.", novel_id))?;
    let novel_root_path_str = novel_entry.path.ok_or_else(|| {
        format!(
            "소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.",
            novel_id
        )
    })?;
    let novel_root_path = PathBuf::from(novel_root_path_str);

    // episode_io::read_episode_content는 LocalEpisodeData (novel 필드 없는) 타입을 반환해야 함
    let mut episode_data_for_file =
        episode_io::read_episode_content(&novel_root_path, &episode_id)?;
    episode_data_for_file.blocks = blocks;
    episode_data_for_file.updated_at = chrono::Utc::now().to_rfc3339();
    // TODO: episode_data_for_file.content_length 업데이트 로직 (blocks 기반으로 계산)
    // TODO: 부모 소설 .muvl의 해당 에피소드 요약 정보(updated_at, contentLength)도 업데이트 필요 (별도 함수 또는 이 함수 확장)

    episode_io::write_episode_content(&novel_root_path, &episode_id, &episode_data_for_file)
}

/// 특정 로컬 에피소드의 메타데이터를 업데이트합니다. (주로 .muvl 파일 내 정보)
#[command]
pub fn update_local_episode_metadata_command(
    app_handle: AppHandle,
    episode_id: String,
    metadata: RustUpdateLocalEpisodeMetadata,
) -> Result<LocalNovelDataEpisodesSummary, String> {
    let novel_id = item_index_manager::get_novel_id_for_item(&app_handle, &episode_id)?
        .ok_or_else(|| {
            format!(
                "아이템 인덱스에서 에피소드 ID {} 에 대한 부모 소설 정보를 찾을 수 없습니다.",
                episode_id
            )
        })?;
    let novel_entry = index_manager::get_novel_entry(&app_handle, &novel_id)?
        .ok_or_else(|| format!("소설 ID {} 를 인덱스에서 찾을 수 없습니다.", novel_id))?;
    let novel_root_path_str = novel_entry.path.ok_or_else(|| {
        format!(
            "소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.",
            novel_id
        )
    })?;
    let novel_root_path = PathBuf::from(novel_root_path_str);

    let mut novel_data = novel_io::read_novel_metadata(&novel_root_path)?;
    let mut updated_summary: Option<LocalNovelDataEpisodesSummary> = None;
    let mut episodes_updated_overall = false;

    if let Some(ref mut episodes_summary_vec) = novel_data.episodes {
        if let Some(ep_summary) = episodes_summary_vec.iter_mut().find(|e| e.id == episode_id) {
            let mut individual_episode_updated = false;
            if let Some(title) = metadata.title {
                // metadata는 RustUpdateLocalEpisodeMetadata 타입
                if ep_summary.title != title {
                    ep_summary.title = title;
                    individual_episode_updated = true;
                }
            }
            if let Some(order) = metadata.order {
                if ep_summary.order != order {
                    ep_summary.order = order;
                    individual_episode_updated = true;
                }
            }
            if let Some(ep_type) = metadata.episode_type {
                // metadata.episode_type은 Option<EpisodeType>
                if ep_summary.episode_type != ep_type {
                    // EpisodeType이 PartialEq를 derive 해야 함
                    ep_summary.episode_type = ep_type;
                    individual_episode_updated = true;
                }
            }

            if individual_episode_updated {
                ep_summary.updated_at = chrono::Utc::now().to_rfc3339();
                updated_summary = Some(ep_summary.clone());
                episodes_updated_overall = true;
            } else {
                updated_summary = Some(ep_summary.clone());
            }
        } else {
            return Err(format!(
                ".muvl 파일에서 에피소드 ID {} 의 정보를 찾을 수 없습니다.",
                episode_id
            ));
        }
        if episodes_updated_overall && metadata.order.is_some() {
            episodes_summary_vec.sort_by_key(|e| e.order);
        }
    } else {
        return Err(format!("소설 ID {} 에 에피소드 목록이 없습니다.", novel_id));
    }

    if episodes_updated_overall {
        novel_data.updated_at = chrono::Utc::now().to_rfc3339();
        novel_io::write_novel_metadata(&novel_root_path, &novel_data)?;
    }

    updated_summary.ok_or_else(|| "에피소드 메타데이터 업데이트 후 요약 정보를 가져올 수 없습니다. 변경사항이 없었을 수 있습니다.".to_string())
}

/// 특정 로컬 에피소드 파일(.mvle) 및 관련 메타데이터(.muvl 내 정보)를 삭제합니다.
#[command]
pub fn delete_local_episode_command(
    app_handle: AppHandle,
    episode_id: String,
) -> Result<(), String> {
    let novel_id = item_index_manager::get_novel_id_for_item(&app_handle, &episode_id)?
        .ok_or_else(|| format!("아이템 인덱스에서 에피소드 ID {} 에 대한 부모 소설 정보를 찾을 수 없습니다. 이미 삭제되었거나 등록되지 않았을 수 있습니다.", episode_id))?;
    let novel_entry = index_manager::get_novel_entry(&app_handle, &novel_id)?
        .ok_or_else(|| format!("소설 ID {} 를 인덱스에서 찾을 수 없습니다.", novel_id))?;
    let novel_root_path_str = novel_entry.path.ok_or_else(|| {
        format!(
            "소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.",
            novel_id
        )
    })?;
    let novel_root_path = PathBuf::from(novel_root_path_str);

    episode_io::delete_episode_file(&novel_root_path, &episode_id)?;

    let mut novel_data = novel_io::read_novel_metadata(&novel_root_path)?;
    let mut updated = false;
    if let Some(ref mut episodes_summary_vec) = novel_data.episodes {
        let initial_len = episodes_summary_vec.len();
        episodes_summary_vec.retain(|ep| ep.id != episode_id);
        if episodes_summary_vec.len() < initial_len {
            updated = true;
        }
    }

    if updated {
        novel_data.updated_at = chrono::Utc::now().to_rfc3339();
        let new_episode_count = novel_data.episodes.as_ref().map_or(0, |e| e.len() as i32);
        novel_data.episode_count = Some(new_episode_count);
        novel_io::write_novel_metadata(&novel_root_path, &novel_data)?;

        if let Some(mut entry_to_update) = index_manager::get_novel_entry(&app_handle, &novel_id)? {
            entry_to_update.episode_count = Some(new_episode_count);
            index_manager::upsert_novel_entry(&app_handle, novel_id.clone(), entry_to_update)?;
        }
    } else {
        println!("Warning: Episode {} was not found in novel metadata (novel: {}), but its .mvle file deletion was attempted.", episode_id, novel_data.title);
    }

    item_index_manager::remove_item_novel_mapping(&app_handle, &episode_id)?;

    Ok(())
}

/// 특정 로컬 소설에 속한 모든 에피소드의 요약 정보 목록을 가져옵니다.
#[command]
pub fn list_local_episode_summaries_command(
    app_handle: AppHandle,
    novel_id: String,
) -> Result<Vec<LocalNovelDataEpisodesSummary>, String> {
    let novel_entry = index_manager::get_novel_entry(&app_handle, &novel_id)?
        .ok_or_else(|| format!("소설 ID {} 를 인덱스에서 찾을 수 없습니다.", novel_id))?;
    let novel_root_path_str = novel_entry.path.ok_or_else(|| {
        format!(
            "소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.",
            novel_id
        )
    })?;
    let novel_root_path = PathBuf::from(novel_root_path_str);

    let novel_data = novel_io::read_novel_metadata(&novel_root_path)?;
    Ok(novel_data.episodes.unwrap_or_else(Vec::new))
}
