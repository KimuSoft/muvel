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
/// `order` 관련 로직이 f32를 사용하도록 수정되었습니다.
#[command]
pub fn create_local_episode_command(
    app_handle: AppHandle,
    novel_id: String,
    options: RustCreateLocalEpisodeOptions, // 이 구조체의 order 필드가 Option<f32>라고 가정
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

    // order를 f32로 처리합니다.
    // RustCreateLocalEpisodeOptions.order가 Option<f32>라고 가정합니다.
    // LocalNovelDataEpisodesSummary.order가 f32라고 가정합니다.
    let new_order: f32 = options.order.unwrap_or_else(|| {
        novel_data.episodes.as_ref().map_or(1.0, |eps| {
            eps.iter()
                    .map(|e| e.order) // e.order가 f32라고 가정
                    .fold(0.0_f32, f32::max) // f32::max를 사용하여 최대값을 찾습니다.
                    + 1.0
        })
    });

    // 1. 파일에 저장될 순수 LocalEpisodeData 생성 (novel 컨텍스트 없음)
    // LocalEpisodeData.order가 f32라고 가정합니다.
    let episode_data_for_file = LocalEpisodeData {
        id: episode_id.clone(),
        novel_id: novel_id.clone(),
        title: options
            .title
            .clone()
            .unwrap_or_else(|| format!("새 에피소드 {}", new_order)), // new_order는 f32
        description: None,
        author_comment: None,
        content_length: Some(0),
        episode_type: options.episode_type.clone().unwrap_or(EpisodeType::Episode),
        order: new_order, // f32 값 할당
        flow_doc: None,
        created_at: current_time_iso.clone(),
        updated_at: current_time_iso.clone(),
        blocks: Vec::new(),
    };

    // 2. 생성된 LocalEpisodeData를 .mvle 파일에 저장
    episode_io::write_episode_content(&novel_root_path, &episode_id, &episode_data_for_file)?;

    // 3. 부모 소설의 메타데이터(.muvl)에 새 에피소드 요약 정보 추가/업데이트
    // LocalNovelDataEpisodesSummary.order가 f32라고 가정합니다.
    let episode_summary_for_novel = LocalNovelDataEpisodesSummary {
        id: episode_id.clone(),
        title: episode_data_for_file.title.clone(),
        order: episode_data_for_file.order, // f32 값 할당
        episode_type: episode_data_for_file.episode_type.clone(),
        content_length: episode_data_for_file.content_length,
        created_at: episode_data_for_file.created_at.clone(),
        updated_at: episode_data_for_file.updated_at.clone(),
    };

    if let Some(ref mut episodes_summary_vec) = novel_data.episodes {
        episodes_summary_vec.push(episode_summary_for_novel);
        // f32 정렬을 위해 sort_by와 partial_cmp 사용
        episodes_summary_vec.sort_by(|a, b| {
            a.order
                .partial_cmp(&b.order)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
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
    // LocalEpisodeDataResponse.order가 f32라고 가정합니다.
    let response_data = LocalEpisodeDataResponse {
        id: episode_data_for_file.id,
        novel_id: episode_data_for_file.novel_id,
        title: episode_data_for_file.title,
        description: episode_data_for_file.description,
        author_comment: episode_data_for_file.author_comment,
        content_length: episode_data_for_file.content_length,
        episode_type: episode_data_for_file.episode_type,
        order: episode_data_for_file.order, // f32 값 할당
        flow_doc: episode_data_for_file.flow_doc,
        created_at: episode_data_for_file.created_at,
        updated_at: episode_data_for_file.updated_at,
        blocks: episode_data_for_file.blocks,
        novel: EpisodeParentNovelContext {
            id: novel_id.clone(),
            share: novel_data.share.clone(),
            title: Some(novel_data.title.clone()),
        },
    };

    Ok(response_data)
}

/// 특정 로컬 에피소드의 전체 데이터(메타데이터 + 블록 + 부모 소설 컨텍스트)를 가져옵니다.
/// `order` 필드는 f32로 처리됩니다.
#[command]
pub fn get_local_episode_data_command(
    app_handle: AppHandle,
    episode_id: String,
) -> Result<LocalEpisodeDataResponse, String> {
    let parent_novel_id = item_index_manager::get_novel_id_for_item(&app_handle, &episode_id)?
        .ok_or_else(|| {
            format!(
                "아이템 인덱스에서 에피소드 ID {} 에 대한 부모 소설 정보를 찾을 수 없습니다.",
                episode_id
            )
        })?;

    let novel_entry =
        index_manager::get_novel_entry(&app_handle, &parent_novel_id)?.ok_or_else(|| {
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

    let parent_novel_meta = novel_io::read_novel_metadata(&novel_root_path)?;
    // LocalEpisodeData.order가 f32라고 가정합니다.
    let episode_data_core = episode_io::read_episode_content(&novel_root_path, &episode_id)?;

    // LocalEpisodeDataResponse.order가 f32라고 가정합니다.
    let full_episode_data_response = LocalEpisodeDataResponse {
        id: episode_data_core.id,
        novel_id: parent_novel_id.clone(),
        title: episode_data_core.title,
        description: episode_data_core.description,
        author_comment: episode_data_core.author_comment,
        content_length: episode_data_core.content_length,
        episode_type: episode_data_core.episode_type,
        order: episode_data_core.order, // f32 값
        flow_doc: episode_data_core.flow_doc,
        created_at: episode_data_core.created_at,
        updated_at: episode_data_core.updated_at,
        blocks: episode_data_core.blocks,
        novel: EpisodeParentNovelContext {
            id: parent_novel_id.clone(),
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

    // LocalEpisodeData.order가 f32라고 가정합니다.
    let mut episode_data_for_file =
        episode_io::read_episode_content(&novel_root_path, &episode_id)?;
    episode_data_for_file.blocks = blocks;
    episode_data_for_file.updated_at = chrono::Utc::now().to_rfc3339();
    // TODO: episode_data_for_file.content_length 업데이트 로직 (blocks 기반으로 계산)
    // TODO: 부모 소설 .muvl의 해당 에피소드 요약 정보(updated_at, contentLength)도 업데이트 필요

    episode_io::write_episode_content(&novel_root_path, &episode_id, &episode_data_for_file)
}

/// 특정 로컬 에피소드의 메타데이터를 업데이트합니다. (주로 .muvl 파일 내 정보)
/// `order` 관련 로직이 f32를 사용하도록 수정되었습니다.
#[command]
pub fn update_local_episode_metadata_command(
    app_handle: AppHandle,
    episode_id: String,
    metadata: RustUpdateLocalEpisodeMetadata, // 이 구조체의 order 필드가 Option<f32>라고 가정
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
        // LocalNovelDataEpisodesSummary.order가 f32라고 가정합니다.
        if let Some(ep_summary) = episodes_summary_vec.iter_mut().find(|e| e.id == episode_id) {
            let mut individual_episode_updated = false;
            // metadata.order가 Option<f32>라고 가정합니다.
            if let Some(title) = metadata.title {
                if ep_summary.title != title {
                    ep_summary.title = title;
                    individual_episode_updated = true;
                }
            }
            if let Some(order_val) = metadata.order {
                // order_val은 f32
                // f32 비교 시에는 근사값을 고려해야 할 수 있으나, 여기서는 직접 비교합니다.
                // 필요하다면 작은 epsilon 값을 사용한 비교를 고려할 수 있습니다.
                // (예: (ep_summary.order - order_val).abs() > f32::EPSILON)
                // 하지만 순서 값의 경우 보통 정확한 값이 할당되므로 직접 비교도 괜찮을 수 있습니다.
                if ep_summary.order != order_val {
                    ep_summary.order = order_val;
                    individual_episode_updated = true;
                }
            }
            if let Some(ep_type) = metadata.episode_type {
                if ep_summary.episode_type != ep_type {
                    ep_summary.episode_type = ep_type;
                    individual_episode_updated = true;
                }
            }

            if individual_episode_updated {
                ep_summary.updated_at = chrono::Utc::now().to_rfc3339();
                updated_summary = Some(ep_summary.clone());
                episodes_updated_overall = true;
            } else {
                // 변경 사항이 없더라도 현재 요약 정보를 반환하기 위해 설정
                updated_summary = Some(ep_summary.clone());
            }
        } else {
            return Err(format!(
                ".muvl 파일에서 에피소드 ID {} 의 정보를 찾을 수 없습니다.",
                episode_id
            ));
        }

        // order 값이 변경되었을 경우에만 정렬 수행
        if episodes_updated_overall && metadata.order.is_some() {
            // f32 정렬을 위해 sort_by와 partial_cmp 사용
            episodes_summary_vec.sort_by(|a, b| {
                a.order
                    .partial_cmp(&b.order)
                    .unwrap_or(std::cmp::Ordering::Equal)
            });
        }
    } else {
        return Err(format!("소설 ID {} 에 에피소드 목록이 없습니다.", novel_id));
    }

    if episodes_updated_overall {
        novel_data.updated_at = chrono::Utc::now().to_rfc3339();
        novel_io::write_novel_metadata(&novel_root_path, &novel_data)?;
    }

    updated_summary.ok_or_else(|| {
        // 이 경우는 individual_episode_updated가 false이고, episodes_summary_vec에서 해당 에피소드를 찾았지만,
        // updated_summary가 None으로 남는 논리적 경로가 없도록 위에서 수정했습니다.
        // 만약 에피소드를 찾지 못했다면 이미 위에서 Err가 반환됩니다.
        // 따라서 "변경사항이 없었을 수 있습니다" 보다 구체적인 에러 또는 정상 반환이 됩니다.
        // 만약 updated_summary가 None이라면, 위의 로직에서 에피소드를 찾지 못했거나 하는 다른 문제가 발생했을 가능성이 있습니다.
        // 하지만 현재 로직상으로는 updated_summary는 항상 Some 값을 가지게 됩니다 (에피소드를 찾았다면).
        "에피소드 메타데이터 업데이트 후 요약 정보를 가져오는 데 실패했습니다. 해당 에피소드를 찾지 못했을 수 있습니다.".to_string()
    })
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
        // 에피소드 파일은 삭제 시도했지만, 메타데이터에는 해당 에피소드가 없었던 경우 경고 출력
        println!("Warning: Episode {} was not found in novel metadata (novel: {}), but its .mvle file deletion was attempted.", episode_id, novel_data.title);
    }

    item_index_manager::remove_item_novel_mapping(&app_handle, &episode_id)?;

    Ok(())
}

/// 특정 로컬 소설에 속한 모든 에피소드의 요약 정보 목록을 가져옵니다.
/// `order` 필드는 f32로 처리됩니다.
#[command]
pub fn list_local_episode_summaries_command(
    app_handle: AppHandle,
    novel_id: String,
) -> Result<Vec<LocalNovelDataEpisodesSummary>, String> {
    // LocalNovelDataEpisodesSummary.order가 f32라고 가정합니다.
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
