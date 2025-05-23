use crate::models::enums::share_type::ShareType;
use crate::models::episode::{LocalEpisodeData, LocalEpisodeDataResponse};
use crate::models::novel::Novel;
use crate::storage::{episode_io, novel_io};
use chrono::Utc;
use tauri::{command, AppHandle};

#[command]
pub fn backup_cloud_episode_command(
    app_handle: AppHandle,
    data: LocalEpisodeDataResponse, // 프론트에서 LocalEpisodeDataResponse 형식으로 데이터를 전달
) -> Result<(), String> {
    let novel_id_from_context = data.novel.id.clone();
    let episode_id_from_data = data.id.clone();

    // 1. 저장 경로 설정 및 디렉토리 생성
    let cloud_novel_root_path =
        novel_io::ensure_cloud_novel_directories(&app_handle, &novel_id_from_context)?;

    // 2. Novel 객체 구성 (최대한 data.novel의 정보를 활용)
    //    LocalEpisodeDataResponse에 없는 Novel 필드는 기본값/None으로 채우거나,
    //    이 백업의 특성에 맞게 설정합니다.
    let novel_metadata_to_save = Novel {
        id: data.novel.id.clone(),
        title: data
            .novel
            .title
            .clone()
            .unwrap_or_else(|| data.title.clone()), // 에피소드 제목이라도 사용
        description: None, // data.description은 에피소드 설명이므로 Novel에는 None
        tags: Some(Vec::new()), // 기본값
        episode_count: None, // 이 백업 시점에서는 알 수 없거나, 별도 로직 필요
        thumbnail: None,   // 기본값
        share: ShareType::Local, // 백업은 로컬 소설로 저장함
        created_at: data.created_at.clone(), // 에피소드 생성 시간을 Novel 생성 시간으로 간주 (백업 시점)
        updated_at: Utc::now().to_rfc3339(), // 현재 시간으로 백업 업데이트 시간 설정
        local_path: cloud_novel_root_path.to_string_lossy().into_owned(), // 클라우드 백업 루트 경로
    };

    // 3. Novel 메타데이터 저장 (NOVEL_ID.muvl)
    novel_io::write_cloud_novel_metadata(
        &cloud_novel_root_path,
        &novel_id_from_context,
        &novel_metadata_to_save,
    )?;

    // 4. LocalEpisodeData 객체 구성 (data.novel 컨텍스트 제외)
    let episode_data_to_save = LocalEpisodeData {
        id: data.id,
        novel_id: data.novel_id, // 이 값은 data.novel.id와 동일해야 함
        title: data.title,
        description: data.description,
        author_comment: data.author_comment,
        content_length: data.content_length,
        ai_rating: data.ai_rating,
        episode_type: data.episode_type,
        order: data.order,
        flow_doc: data.flow_doc,
        created_at: data.created_at,
        updated_at: data.updated_at, // 에피소드 자체의 최종 수정 시간
        blocks: data.blocks,
    };

    // 5. Episode 데이터 저장 (episodes/EPISODE_ID.mvle)
    //    episode_io::write_episode_content는 첫 번째 인자로 novel_root_path를 받음
    episode_io::write_episode_content(
        &cloud_novel_root_path,
        &episode_id_from_data,
        &episode_data_to_save,
    )?;

    println!(
        "클라우드 소설 {}의 에피소드 {} 백업 완료. 경로: {}",
        novel_id_from_context,
        episode_id_from_data,
        cloud_novel_root_path.display()
    );
    Ok(())
}
