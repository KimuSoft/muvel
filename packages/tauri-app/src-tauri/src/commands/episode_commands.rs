// src-tauri/src/app_lib/commands/episode_commands.rs

use std::path::PathBuf;
use tauri::{AppHandle, command};
use uuid::Uuid;

// storage 모듈 및 models 모듈의 타입들을 가져옵니다.
// 이제 ApiEpisode 같은 타입은 직접 사용하지 않고, models.rs의 Rust 타입을 사용합니다.
use crate::storage::{episode_io, novel_io, index_manager};
use crate::models::{
    LocalEpisodeData, // .mvle 파일 내용 및 에피소드 전체 데이터
    Block,            // 에피소드 내 블록 구조체
    CreateLocalEpisodeOptions as RustCreateLocalEpisodeOptions, // models.rs에 정의된 Rust 구조체
    UpdateLocalEpisodeMetadata as RustUpdateLocalEpisodeMetadata, // models.rs에 정의된 Rust 구조체
    UpdateLocalEpisodeBlocksData as RustUpdateLocalEpisodeBlocksData, // Vec<Block> 타입 별칭
    LocalNovelData, // .muvl 파일 내용을 다루기 위해 필요
    EpisodeType,    // models.rs에 정의된 Rust enum
    LocalNovelDataEpisodesSummary, // .muvl 내 에피소드 요약 정보 타입
};

/// 새로운 로컬 에피소드를 생성하고, 부모 소설의 메타데이터(.muvl)도 업데이트합니다.
#[command]
pub fn create_local_episode_command(
    app_handle: AppHandle,
    // novel_id를 명시적으로 받습니다.
    // options는 models.rs에 정의된 RustCreateLocalEpisodeOptions 사용
    novel_id: String,
    options: RustCreateLocalEpisodeOptions,
) -> Result<LocalEpisodeData, String> {
    // 1. 부모 소설의 루트 경로를 인덱스에서 가져옵니다.
    let novel_entry = index_manager::get_novel_entry(&app_handle, &novel_id)?
        .ok_or_else(|| format!("부모 소설 ID {} 를 인덱스에서 찾을 수 없습니다.", novel_id))?;
    let novel_root_path_str = novel_entry.path
        .ok_or_else(|| format!("소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.", novel_id))?;
    let novel_root_path = PathBuf::from(novel_root_path_str);

    // 2. 새 에피소드를 위한 UUID 생성
    let episode_id = Uuid::new_v4().to_string();
    let current_time_iso = chrono::Utc::now().to_rfc3339();

    // 3. 부모 소설의 메타데이터(.muvl)를 읽어 현재 에피소드 목록 및 다음 순서 결정
    let mut novel_data = novel_io::read_novel_metadata(&novel_root_path)?;

    let new_order = options.order.unwrap_or_else(|| {
        novel_data.episodes.as_ref().map_or(1, |eps| {
            eps.iter().map(|e| e.order).max().unwrap_or(0) + 1
        })
    });

    // 4. 초기 LocalEpisodeData 객체 생성 (블록은 비어있음)
    let new_episode_data = LocalEpisodeData {
        id: episode_id.clone(),
        novel_id: novel_id.clone(), // 명시적으로 받은 novel_id 사용
        title: options.title.unwrap_or_else(|| format!("새 에피소드 {}", new_order)),
        description: None, // options에서 받을 수 있도록 models.rs 수정 가능
        author_comment: None, // options에서 받을 수 있도록 models.rs 수정 가능
        content_length: Some(0),
        episode_type: options.episode_type.unwrap_or(EpisodeType::Episode),
        order: new_order,
        flow_doc: None,
        created_at: current_time_iso.clone(),
        updated_at: current_time_iso.clone(),
        blocks: Vec::new(),
    };

    // 5. 생성된 LocalEpisodeData를 .mvle 파일에 저장
    episode_io::write_episode_content(&novel_root_path, &episode_id, &new_episode_data)?;

    // 6. 부모 소설의 메타데이터(.muvl)에 새 에피소드 요약 정보 추가/업데이트
    let episode_summary_for_novel = LocalNovelDataEpisodesSummary {
        id: episode_id.clone(),
        title: new_episode_data.title.clone(),
        order: new_episode_data.order,
        episode_type: new_episode_data.episode_type.clone(),
        content_length: new_episode_data.content_length,
        created_at: new_episode_data.created_at.clone(),
        updated_at: new_episode_data.updated_at.clone(),
    };

    if let Some(ref mut episodes_summary_vec) = novel_data.episodes {
        episodes_summary_vec.push(episode_summary_for_novel);
        episodes_summary_vec.sort_by_key(|e| e.order); // 순서대로 정렬
    } else {
        novel_data.episodes = Some(vec![episode_summary_for_novel]);
    }
    novel_data.episode_count = Some(novel_data.episodes.as_ref().map_or(0, |e| e.len() as i32));
    novel_data.updated_at = chrono::Utc::now().to_rfc3339();
    novel_io::write_novel_metadata(&novel_root_path, &novel_data)?;

    Ok(new_episode_data)
}

/// 특정 로컬 에피소드의 전체 데이터(메타데이터 + 블록)를 가져옵니다.
#[command]
pub fn get_local_episode_data_command(
    app_handle: AppHandle,
    novel_id: String, // 부모 소설 ID를 명시적으로 받음
    episode_id: String,
) -> Result<LocalEpisodeData, String> {
    let novel_entry = index_manager::get_novel_entry(&app_handle, &novel_id)?
        .ok_or_else(|| format!("소설 ID {} 를 인덱스에서 찾을 수 없습니다.", novel_id))?;
    let novel_root_path_str = novel_entry.path
        .ok_or_else(|| format!("소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.", novel_id))?;
    let novel_root_path = PathBuf::from(novel_root_path_str);

    episode_io::read_episode_content(&novel_root_path, &episode_id)
}

/// 특정 로컬 에피소드의 블록 내용을 업데이트합니다.
#[command]
pub fn update_local_episode_blocks_command(
    app_handle: AppHandle,
    novel_id: String, // 부모 소설 ID를 명시적으로 받음
    episode_id: String,
    blocks: RustUpdateLocalEpisodeBlocksData, // Vec<Block> 타입
) -> Result<(), String> {
    let novel_entry = index_manager::get_novel_entry(&app_handle, &novel_id)?
        .ok_or_else(|| format!("소설 ID {} 를 인덱스에서 찾을 수 없습니다.", novel_id))?;
    let novel_root_path_str = novel_entry.path
        .ok_or_else(|| format!("소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.", novel_id))?;
    let novel_root_path = PathBuf::from(novel_root_path_str);

    let mut episode_data = episode_io::read_episode_content(&novel_root_path, &episode_id)?;
    episode_data.blocks = blocks;
    episode_data.updated_at = chrono::Utc::now().to_rfc3339();
    // TODO: episode_data.content_length 업데이트 로직 (blocks 기반으로 계산)

    episode_io::write_episode_content(&novel_root_path, &episode_id, &episode_data)
}

/// 특정 로컬 에피소드의 메타데이터를 업데이트합니다. (주로 .muvl 파일 내 정보)
#[command]
pub fn update_local_episode_metadata_command(
    app_handle: AppHandle,
    novel_id: String, // 부모 소설 ID를 명시적으로 받음
    episode_id: String,
    metadata: RustUpdateLocalEpisodeMetadata,
) -> Result<LocalNovelDataEpisodesSummary, String> { // 업데이트된 요약 정보 반환
    let novel_entry = index_manager::get_novel_entry(&app_handle, &novel_id)?
        .ok_or_else(|| format!("소설 ID {} 를 인덱스에서 찾을 수 없습니다.", novel_id))?;
    let novel_root_path_str = novel_entry.path
        .ok_or_else(|| format!("소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.", novel_id))?;
    let novel_root_path = PathBuf::from(novel_root_path_str);

    let mut novel_data = novel_io::read_novel_metadata(&novel_root_path)?;
    let mut updated_summary: Option<LocalNovelDataEpisodesSummary> = None;

    if let Some(ref mut episodes_summary_vec) = novel_data.episodes {
        if let Some(ep_summary) = episodes_summary_vec.iter_mut().find(|e| e.id == episode_id) {
            if let Some(title) = metadata.title { ep_summary.title = title; }
            if let Some(order) = metadata.order { ep_summary.order = order; }
            if let Some(ep_type) = metadata.episode_type { ep_summary.episode_type = ep_type; }
            // description, authorComment는 LocalNovelDataEpisodesSummary에 없으므로,
            // 만약 업데이트하려면 .mvle 파일의 해당 필드를 업데이트해야 함 (별도 커맨드 또는 이 커맨드 확장)
            ep_summary.updated_at = chrono::Utc::now().to_rfc3339();
            updated_summary = Some(ep_summary.clone());
        } else {
            return Err(format!(".muvl 파일에서 에피소드 ID {} 의 정보를 찾을 수 없습니다.", episode_id));
        }

        // 순서가 변경된 경우 전체 목록 재정렬
        if metadata.order.is_some() {
            episodes_summary_vec.sort_by_key(|e| e.order);
        }
    } else {
        return Err(format!("소설 ID {} 에 에피소드 목록이 없습니다.", novel_id));
    }

    novel_data.updated_at = chrono::Utc::now().to_rfc3339();
    novel_io::write_novel_metadata(&novel_root_path, &novel_data)?;

    updated_summary.ok_or_else(|| "에피소드 메타데이터 업데이트 후 요약 정보를 가져올 수 없습니다.".to_string())
}

/// 특정 로컬 에피소드 파일(.mvle) 및 관련 메타데이터(.muvl 내 정보)를 삭제합니다.
#[command]
pub fn delete_local_episode_command(
    app_handle: AppHandle,
    novel_id: String, // 부모 소설 ID를 명시적으로 받음
    episode_id: String,
) -> Result<(), String> {
    let novel_entry = index_manager::get_novel_entry(&app_handle, &novel_id)?
        .ok_or_else(|| format!("소설 ID {} 를 인덱스에서 찾을 수 없습니다.", novel_id))?;
    let novel_root_path_str = novel_entry.path
        .ok_or_else(|| format!("소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.", novel_id))?;
    let novel_root_path = PathBuf::from(novel_root_path_str);

    // 1. .mvle 파일을 삭제합니다.
    episode_io::delete_episode_file(&novel_root_path, &episode_id)?;

    // 2. 부모 소설의 .muvl 파일을 읽어 해당 에피소드 정보를 제거하고 다시 저장합니다.
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
        novel_data.episode_count = Some(novel_data.episodes.as_ref().map_or(0, |e| e.len() as i32));
        novel_io::write_novel_metadata(&novel_root_path, &novel_data)?;

        // 인덱스의 episodeCount도 업데이트
        if let Some(mut entry_to_update) = index_manager::get_novel_entry(&app_handle, &novel_id)? {
            entry_to_update.episode_count = novel_data.episode_count;
            index_manager::upsert_novel_entry(&app_handle, novel_id.clone(), entry_to_update)?;
        }
    } else {
        println!("Warning: Episode {} was not found in novel metadata (file: {}), but its .mvle file deletion was attempted.", episode_id, novel_data.title);
    }

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
    let novel_root_path_str = novel_entry.path
        .ok_or_else(|| format!("소설 ID {} 에 대한 경로 정보가 인덱스에 없습니다.", novel_id))?;
    let novel_root_path = PathBuf::from(novel_root_path_str);

    let novel_data = novel_io::read_novel_metadata(&novel_root_path)?;
    Ok(novel_data.episodes.unwrap_or_else(Vec::new))
}
