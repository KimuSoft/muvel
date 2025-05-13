// src-tauri/src/storage/episode_io.rs

use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};

// models.rs에 정의된 LocalEpisodeData 및 Block 구조체를 사용합니다.
use crate::models::LocalEpisodeData;

// 에피소드 파일들을 저장할 폴더 이름 (novel_io.rs와 일관성 유지)
pub const EPISODES_DIRNAME: &str = "episodes";
// 에피소드 파일의 확장자
const EPISODE_FILE_EXTENSION: &str = "mvle";

/// 주어진 소설 루트 경로와 에피소드 ID를 사용하여 에피소드 파일의 전체 경로를 구성합니다.
/// 에피소드 ID가 파일명이 됩니다 (예: novel_root_path/episodes/episode_id.mvle).
///
/// # Arguments
/// * `novel_root_path`: 소설의 루트 디렉토리 경로.
/// * `episode_id`: 에피소드의 UUID (이것이 파일명이 됨).
///
/// # Returns
/// * `PathBuf`: 에피소드 파일(.mvle)의 전체 경로.
fn get_episode_file_path(novel_root_path: &Path, episode_id: &str) -> PathBuf {
    novel_root_path
        .join(EPISODES_DIRNAME)
        .join(format!("{}.{}", episode_id, EPISODE_FILE_EXTENSION))
}

/// 특정 로컬 에피소드 파일(.mvle)을 읽어 LocalEpisodeData 객체로 반환합니다.
///
/// # Arguments
/// * `novel_root_path`: 읽어올 에피소드가 속한 소설의 루트 디렉토리 경로.
/// * `episode_id`: 읽어올 에피소드의 UUID (파일명).
///
/// # Returns
/// * `Result<LocalEpisodeData, String>`: 성공 시 `LocalEpisodeData`, 실패 시 에러 메시지.
pub fn read_episode_content(
    novel_root_path: &Path,
    episode_id: &str,
) -> Result<LocalEpisodeData, String> {
    let episode_file_path = get_episode_file_path(novel_root_path, episode_id);

    if !episode_file_path.exists() {
        return Err(format!(
            "에피소드 파일을 찾을 수 없습니다: {:?}",
            episode_file_path
        ));
    }

    let mut file_content = String::new();
    fs::File::open(&episode_file_path)
        .map_err(|e| {
            format!(
                "에피소드 파일을 열 수 없습니다 (경로: {:?}): {}",
                episode_file_path, e
            )
        })?
        .read_to_string(&mut file_content)
        .map_err(|e| format!("에피소드 파일 내용을 읽을 수 없습니다: {}", e))?;

    // .mvle 파일은 LocalEpisodeData 구조체 전체를 저장하거나,
    // 또는 Block 배열만 저장하고 나머지 메타데이터는 .muvl에서 관리할 수도 있습니다.
    // 여기서는 LocalEpisodeData 전체를 저장한다고 가정합니다.
    serde_json::from_str(&file_content)
        .map_err(|e| format!("에피소드 파일 JSON 파싱에 실패했습니다: {}", e))
}

/// LocalEpisodeData 객체 (주로 블록 내용)를 에피소드 파일(.mvle)에 저장(업데이트)합니다.
/// 원자적 쓰기를 사용하여 데이터 손실을 방지합니다.
///
/// # Arguments
/// * `novel_root_path`: 저장할 에피소드가 속한 소설의 루트 디렉토리 경로.
/// * `episode_id`: 저장할 에피소드의 UUID (파일명).
/// * `data`: 저장할 `LocalEpisodeData` 객체의 참조.
///
/// # Returns
/// * `Result<(), String>`: 성공 시 빈 튜플, 실패 시 에러 메시지.
pub fn write_episode_content(
    novel_root_path: &Path,
    episode_id: &str,
    data: &LocalEpisodeData, // 또는 blocks: &[Block] 만 받을 수도 있음
) -> Result<(), String> {
    let episode_file_path = get_episode_file_path(novel_root_path, episode_id);
    // 에피소드 파일이 저장될 부모 디렉토리 (novel_root_path/episodes/)
    let parent_dir = episode_file_path.parent().ok_or_else(|| {
        format!(
            "에피소드 파일의 부모 디렉토리를 찾을 수 없습니다: {:?}",
            episode_file_path
        )
    })?;

    // 부모 디렉토리(episodes/)가 존재하지 않으면 생성합니다. novel_io::create_novel_directories에서 이미 생성되었을 수 있습니다.
    if !parent_dir.exists() {
        fs::create_dir_all(parent_dir).map_err(|e| {
            format!(
                "에피소드 저장 디렉토리 생성에 실패했습니다 (경로: {:?}): {}",
                parent_dir, e
            )
        })?;
    }

    let temp_file_path =
        episode_file_path.with_extension(&format!("{}.tmp", EPISODE_FILE_EXTENSION));

    let mut temp_file = fs::File::create(&temp_file_path).map_err(|e| {
        format!(
            "임시 에피소드 파일을 생성할 수 없습니다 (경로: {:?}): {}",
            temp_file_path, e
        )
    })?;

    let json_string = serde_json::to_string_pretty(data).map_err(|e| {
        format!(
            "에피소드 데이터를 JSON으로 직렬화하는 데 실패했습니다: {}",
            e
        )
    })?;

    temp_file
        .write_all(json_string.as_bytes())
        .map_err(|e| format!("임시 에피소드 파일에 쓰는 데 실패했습니다: {}", e))?;

    fs::rename(&temp_file_path, &episode_file_path).map_err(|e| {
        format!(
            "에피소드 파일을 원자적으로 교체하는 데 실패했습니다 (원본: {:?}, 임시: {:?}): {}",
            episode_file_path, temp_file_path, e
        )
    })?;

    Ok(())
}

/// 특정 로컬 에피소드 파일(.mvle)을 삭제합니다.
///
/// # Arguments
/// * `novel_root_path`: 삭제할 에피소드가 속한 소설의 루트 디렉토리 경로.
/// * `episode_id`: 삭제할 에피소드의 UUID (파일명).
///
/// # Returns
/// * `Result<(), String>`: 성공 시 빈 튜플, 실패 시 에러 메시지.
pub fn delete_episode_file(novel_root_path: &Path, episode_id: &str) -> Result<(), String> {
    let episode_file_path = get_episode_file_path(novel_root_path, episode_id);

    if episode_file_path.exists() && episode_file_path.is_file() {
        fs::remove_file(&episode_file_path).map_err(|e| {
            format!(
                "에피소드 파일 삭제에 실패했습니다 (경로: {:?}): {}",
                episode_file_path, e
            )
        })?;
        Ok(())
    } else {
        // 삭제할 파일이 없거나 파일이 아니어도 성공으로 처리하거나,
        // 경고를 로깅할 수 있습니다. 여기서는 성공으로 간주합니다.
        println!(
            "삭제할 에피소드 파일이 존재하지 않거나 파일이 아닙니다: {:?}",
            episode_file_path
        );
        Ok(())
    }
}

/// 특정 소설의 `episodes` 디렉토리 내 모든 에피소드 파일명(ID) 목록을 가져옵니다.
/// 이는 소설 메타데이터(.muvl)의 에피소드 목록과 실제 파일 시스템 간의 동기화 확인에 사용될 수 있습니다.
///
/// # Arguments
/// * `novel_root_path`: 에피소드 목록을 조회할 소설의 루트 디렉토리 경로.
///
/// # Returns
/// * `Result<Vec<String>, String>`: 성공 시 에피소드 ID(파일명에서 확장자 제외) 문자열 벡터, 실패 시 에러 메시지.
pub fn list_episode_ids_from_fs(novel_root_path: &Path) -> Result<Vec<String>, String> {
    let episodes_dir_path = novel_root_path.join(EPISODES_DIRNAME);
    let mut episode_ids = Vec::new();

    if !episodes_dir_path.exists() || !episodes_dir_path.is_dir() {
        // 에피소드 폴더가 없으면 빈 목록 반환 (오류는 아님)
        return Ok(episode_ids);
    }

    for entry in fs::read_dir(&episodes_dir_path).map_err(|e| {
        format!(
            "에피소드 디렉토리를 읽을 수 없습니다 (경로: {:?}): {}",
            episodes_dir_path, e
        )
    })? {
        let entry = entry.map_err(|e| format!("디렉토리 항목 읽기 실패: {}", e))?;
        let path = entry.path();
        // 파일이고, 올바른 확장자(.mvle)를 가졌는지 확인
        if path.is_file()
            && path
                .extension()
                .map_or(false, |ext| ext == EPISODE_FILE_EXTENSION)
        {
            // 파일명에서 확장자를 제외한 부분이 에피소드 ID
            if let Some(file_stem) = path.file_stem().and_then(|stem| stem.to_str()) {
                episode_ids.push(file_stem.to_string());
            }
        }
    }
    Ok(episode_ids)
}
