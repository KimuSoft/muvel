use crate::models::novel::Novel;
use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use uuid::Uuid;

const NOVEL_METADATA_EXTENSION: &str = "muvl";
pub const EPISODES_DIRNAME: &str = "episodes";
const RESOURCES_DIRNAME: &str = "resources";
const IMAGES_SUBDIR_IN_RESOURCES: &str = "images";

/// 주어진 소설 루트 경로에서 메타데이터 파일(*.muvl)의 전체 경로를 찾습니다.
/// 루트 경로에 .muvl 확장자를 가진 파일이 하나만 있어야 합니다.
fn find_metadata_file_path(novel_root_path: &Path) -> Result<PathBuf, String> {
    let mut metadata_files = Vec::new();
    if !novel_root_path.is_dir() {
        // 경로가 디렉토리인지 먼저 확인
        return Err(format!(
            "제공된 소설 루트 경로가 디렉토리가 아닙니다: {:?}",
            novel_root_path
        ));
    }
    for entry in fs::read_dir(novel_root_path).map_err(|e| {
        format!(
            "소설 루트 디렉토리 읽기 실패 (경로: {:?}): {}",
            novel_root_path, e
        )
    })? {
        let entry = entry.map_err(|e| format!("디렉토리 항목 읽기 실패: {}", e))?;
        let path = entry.path();
        if path.is_file()
            && path
                .extension()
                .map_or(false, |ext| ext == NOVEL_METADATA_EXTENSION)
        {
            metadata_files.push(path);
        }
    }

    if metadata_files.is_empty() {
        Err(format!(
            "소설 메타데이터 파일(.muvl)을 찾을 수 없습니다 (경로: {:?})",
            novel_root_path
        ))
    } else if metadata_files.len() > 1 {
        Err(format!(
            "소설 루트 경로에 여러 개의 .muvl 파일이 존재합니다: {:?} (발견된 파일: {:?})",
            novel_root_path, metadata_files
        ))
    } else {
        Ok(metadata_files.remove(0))
    }
}

/// 특정 로컬 소설의 메타데이터 파일(*.muvl)을 읽어 Novel 객체와 실제 파일 경로를 반환합니다.
/// 파일명은 유연하게 찾습니다. (이전 read_novel_metadata_flexible에서 반환값 변경)
pub fn read_novel_metadata_with_path(novel_root_path: &Path) -> Result<(Novel, PathBuf), String> {
    let metadata_path = find_metadata_file_path(novel_root_path)?;

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

    let novel_data: Novel = serde_json::from_str(&file_content).map_err(|e| {
        format!(
            "소설 메타데이터 파일 JSON 파싱에 실패했습니다 (경로: {:?}): {}",
            metadata_path, e
        )
    })?;

    Ok((novel_data, metadata_path))
}

/// 새 소설 생성 시 Novel 객체를 소설 메타데이터 파일(.muvl)에 저장합니다.
/// 파일명은 소설 루트 디렉토리의 이름과 동일하게 설정됩니다. (예: novel_root_path의 마지막 세그먼트 + .muvl)
pub fn write_novel_metadata_for_creation(
    novel_root_path: &Path,
    data: &Novel,
) -> Result<PathBuf, String> {
    // 저장된 파일 경로 반환
    let novel_folder_name = novel_root_path
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or_else(|| {
            format!(
                "소설 루트 경로에서 폴더명을 추출할 수 없습니다: {:?}",
                novel_root_path
            )
        })?;

    let metadata_filename = format!("{}.{}", novel_folder_name, NOVEL_METADATA_EXTENSION);
    let metadata_path = novel_root_path.join(&metadata_filename); // 변경: metadata_filename 참조

    // 이 함수는 '생성' 시에만 호출되므로, 기존 파일 존재 여부 확인은 덜 중요할 수 있으나,
    // 만약을 위해 동일 경로에 파일이 있다면 오류를 발생시키거나 덮어쓰기 정책을 정해야 합니다.
    // 여기서는 덮어쓰는 것으로 가정하고 원자적 쓰기를 사용합니다.
    if metadata_path.exists() {
        eprintln!(
            "경고: 새 소설 생성 위치에 이미 메타데이터 파일이 존재합니다. ({:?}). 덮어씁니다.",
            metadata_path
        );
    }

    let temp_file_path = novel_root_path.join(format!(
        "{}.{}.tmp",
        novel_folder_name, NOVEL_METADATA_EXTENSION
    ));

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

    Ok(metadata_path)
}

/// 기존 소설 업데이트 시, 현재 폴더 내의 유일한 .muvl 파일을 찾아 그 파일에 Novel 데이터를 덮어씁니다.
pub fn update_existing_novel_metadata_file(
    novel_root_path: &Path,
    data: &Novel,
) -> Result<PathBuf, String> {
    // 업데이트된 파일 경로 반환
    // 1. 현재 폴더 내의 유일한 .muvl 파일을 찾는다.
    let target_metadata_path = find_metadata_file_path(novel_root_path)?;

    // 2. 찾은 파일에 데이터를 원자적으로 덮어쓴다.
    let temp_file_path = novel_root_path.join(format!(
        "{}.tmp",
        target_metadata_path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
    ));

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

    fs::rename(&temp_file_path, &target_metadata_path).map_err(|e| {
        format!(
            "메타데이터 파일을 원자적으로 교체하는 데 실패했습니다 (원본: {:?}, 임시: {:?}): {}",
            target_metadata_path, temp_file_path, e
        )
    })?;

    Ok(target_metadata_path)
}

pub fn create_novel_directories(novel_root_path: &Path) -> Result<(), String> {
    fs::create_dir_all(novel_root_path).map_err(|e| {
        format!(
            "소설 루트 디렉토리 생성에 실패했습니다 (경로: {:?}): {}",
            novel_root_path, e
        )
    })?;
    let episodes_path = novel_root_path.join(EPISODES_DIRNAME);
    fs::create_dir_all(&episodes_path).map_err(|e| {
        format!(
            "에피소드 디렉토리 생성에 실패했습니다 (경로: {:?}): {}",
            episodes_path, e
        )
    })?;
    let resources_path = novel_root_path.join(RESOURCES_DIRNAME);
    fs::create_dir_all(&resources_path).map_err(|e| {
        format!(
            "리소스 디렉토리 생성에 실패했습니다 (경로: {:?}): {}",
            resources_path, e
        )
    })?;
    let images_path = resources_path.join(IMAGES_SUBDIR_IN_RESOURCES);
    fs::create_dir_all(&images_path).map_err(|e| {
        format!(
            "이미지 리소스 디렉토리 생성에 실패했습니다 (경로: {:?}): {}",
            images_path, e
        )
    })?;
    Ok(())
}

pub fn delete_novel_project_directory(novel_root_path: &Path) -> Result<(), String> {
    if novel_root_path.exists() && novel_root_path.is_dir() {
        fs::remove_dir_all(novel_root_path).map_err(|e| {
            format!(
                "소설 프로젝트 디렉토리 삭제에 실패했습니다 (경로: {:?}): {}",
                novel_root_path, e
            )
        })?;
    } else {
        println!(
            "삭제할 소설 프로젝트 디렉토리가 존재하지 않거나 디렉토리가 아닙니다: {:?}",
            novel_root_path
        );
    }
    Ok(())
}

pub fn save_image_to_resources(
    novel_root_path: &Path,
    original_file_name: &str,
    file_bytes: Vec<u8>,
) -> Result<String, String> {
    let images_dir = novel_root_path
        .join(RESOURCES_DIRNAME)
        .join(IMAGES_SUBDIR_IN_RESOURCES);
    fs::create_dir_all(&images_dir).map_err(|e| {
        format!(
            "이미지 저장 디렉토리 생성 실패 ('{}'): {}",
            images_dir.display(),
            e
        )
    })?;
    let original_path_obj = Path::new(original_file_name);
    let extension = original_path_obj
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("png");
    let unique_filename = format!("{}.{}", Uuid::new_v4(), extension);
    let target_file_path = images_dir.join(&unique_filename);
    fs::write(&target_file_path, file_bytes).map_err(|e| {
        format!(
            "이미지 파일 쓰기 실패 ('{}'): {}",
            target_file_path.display(),
            e
        )
    })?;
    target_file_path
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| {
            format!(
                "저장된 파일 경로를 문자열로 변환하는데 실패했습니다: '{}'",
                target_file_path.display()
            )
        })
}
