// src-tauri/src/storage/novel_io.rs

use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf}; // 경로 관련 타입

// 현재 크레이트(프로젝트)의 models 모듈에서 LocalNovelData 구조체를 가져옵니다.
// 이 구조체는 models.rs 파일에 정의되어 있어야 하며, .muvl 파일의 내용을 나타냅니다.
use crate::models::LocalNovelData;

// 소설 메타데이터 파일의 표준 이름
pub const NOVEL_METADATA_FILENAME: &str = "novel-metadata.muvl";
// 에피소드 파일들을 저장할 폴더 이름
const EPISODES_DIRNAME: &str = "episodes";
// 리소스 파일들(표지 이미지 등)을 저장할 폴더 이름
const RESOURCES_DIRNAME: &str = "resources";

/// 주어진 소설 루트 경로에서 메타데이터 파일의 전체 경로를 구성합니다.
///
/// # Arguments
/// * `novel_root_path`: 소설의 루트 디렉토리 경로.
///
/// # Returns
/// * `PathBuf`: 소설 메타데이터 파일(.muvl)의 전체 경로.
fn get_metadata_file_path(novel_root_path: &Path) -> PathBuf {
    novel_root_path.join(NOVEL_METADATA_FILENAME)
}

/// 특정 로컬 소설의 메타데이터 파일(.muvl)을 읽어 LocalNovelData 객체로 반환합니다.
///
/// # Arguments
/// * `novel_root_path`: 읽어올 소설의 루트 디렉토리 경로.
///
/// # Returns
/// * `Result<LocalNovelData, String>`: 성공 시 `LocalNovelData`, 실패 시 에러 메시지.
pub fn read_novel_metadata(novel_root_path: &Path) -> Result<LocalNovelData, String> {
    let metadata_path = get_metadata_file_path(novel_root_path);

    if !metadata_path.exists() {
        return Err(format!(
            "소설 메타데이터 파일을 찾을 수 없습니다: {:?}",
            metadata_path
        ));
    }

    let mut file_content = String::new();
    fs::File::open(&metadata_path)
        .map_err(|e| {
            format!(
                "소설 메타데이터 파일을 열 수 없습니다 (경로: {:?}): {}",
                metadata_path, e
            )
        })?
        .read_to_string(&mut file_content)
        .map_err(|e| format!("소설 메타데이터 파일 내용을 읽을 수 없습니다: {}", e))?;

    serde_json::from_str(&file_content)
        .map_err(|e| format!("소설 메타데이터 파일 JSON 파싱에 실패했습니다: {}", e))
}

/// LocalNovelData 객체를 소설 메타데이터 파일(.muvl)에 저장(업데이트)합니다.
/// 원자적 쓰기를 사용하여 데이터 손실을 방지합니다.
///
/// # Arguments
/// * `novel_root_path`: 저장할 소설의 루트 디렉토리 경로.
/// * `data`: 저장할 `LocalNovelData` 객체의 참조.
///
/// # Returns
/// * `Result<(), String>`: 성공 시 빈 튜플, 실패 시 에러 메시지.
pub fn write_novel_metadata(novel_root_path: &Path, data: &LocalNovelData) -> Result<(), String> {
    let metadata_path = get_metadata_file_path(novel_root_path);
    let parent_dir = metadata_path.parent().ok_or_else(|| {
        format!(
            "메타데이터 파일의 부모 디렉토리를 찾을 수 없습니다: {:?}",
            metadata_path
        )
    })?;

    if !parent_dir.exists() {
        fs::create_dir_all(parent_dir).map_err(|e| {
            format!(
                "소설 루트 디렉토리 생성에 실패했습니다 (경로: {:?}): {}",
                parent_dir, e
            )
        })?;
    }

    let temp_file_path = metadata_path.with_extension("muvl.tmp");

    let mut temp_file = fs::File::create(&temp_file_path).map_err(|e| {
        format!(
            "임시 메타데이터 파일을 생성할 수 없습니다 (경로: {:?}): {}",
            temp_file_path, e
        )
    })?;

    let json_string = serde_json::to_string_pretty(data).map_err(|e| {
        format!(
            "소설 메타데이터를 JSON으로 직렬화하는 데 실패했습니다: {}",
            e
        )
    })?;

    temp_file
        .write_all(json_string.as_bytes())
        .map_err(|e| format!("임시 메타데이터 파일에 쓰는 데 실패했습니다: {}", e))?;

    fs::rename(&temp_file_path, &metadata_path).map_err(|e| {
        format!(
            "메타데이터 파일을 원자적으로 교체하는 데 실패했습니다 (원본: {:?}, 임시: {:?}): {}",
            metadata_path, temp_file_path, e
        )
    })?;

    Ok(())
}

/// 새로운 로컬 소설을 위한 기본 디렉토리 구조(루트, episodes, resources)를 생성합니다.
///
/// # Arguments
/// * `novel_root_path`: 생성할 소설의 루트 디렉토리 경로.
///
/// # Returns
/// * `Result<(), String>`: 성공 시 빈 튜플, 실패 시 에러 메시지.
pub fn create_novel_directories(novel_root_path: &Path) -> Result<(), String> {
    // 루트 디렉토리 생성 (이미 존재할 수 있으므로 create_dir_all 사용)
    fs::create_dir_all(novel_root_path).map_err(|e| {
        format!(
            "소설 루트 디렉토리 생성에 실패했습니다 (경로: {:?}): {}",
            novel_root_path, e
        )
    })?;

    // episodes 디렉토리 생성
    let episodes_path = novel_root_path.join(EPISODES_DIRNAME);
    fs::create_dir_all(&episodes_path).map_err(|e| {
        format!(
            "에피소드 디렉토리 생성에 실패했습니다 (경로: {:?}): {}",
            episodes_path, e
        )
    })?;

    // resources 디렉토리 생성
    let resources_path = novel_root_path.join(RESOURCES_DIRNAME);
    fs::create_dir_all(&resources_path).map_err(|e| {
        format!(
            "리소스 디렉토리 생성에 실패했습니다 (경로: {:?}): {}",
            resources_path, e
        )
    })?;

    Ok(())
}

/// 특정 로컬 소설 프로젝트의 전체 디렉토리(루트 폴더 및 하위 모든 파일/폴더)를 삭제합니다.
/// 주의: 이 작업은 되돌릴 수 없습니다.
///
/// # Arguments
/// * `novel_root_path`: 삭제할 소설의 루트 디렉토리 경로.
///
/// # Returns
/// * `Result<(), String>`: 성공 시 빈 튜플, 실패 시 에러 메시지.
pub fn delete_novel_project_directory(novel_root_path: &Path) -> Result<(), String> {
    if novel_root_path.exists() && novel_root_path.is_dir() {
        fs::remove_dir_all(novel_root_path).map_err(|e| {
            format!(
                "소설 프로젝트 디렉토리 삭제에 실패했습니다 (경로: {:?}): {}",
                novel_root_path, e
            )
        })?;
        Ok(())
    } else {
        // 삭제할 디렉토리가 없거나 디렉토리가 아니어도 성공으로 처리하거나,
        // 경고를 로깅할 수 있습니다. 여기서는 성공으로 간주합니다.
        println!(
            "삭제할 소설 프로젝트 디렉토리가 존재하지 않거나 디렉토리가 아닙니다: {:?}",
            novel_root_path
        );
        Ok(())
    }
}
