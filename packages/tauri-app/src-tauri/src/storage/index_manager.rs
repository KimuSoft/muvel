use std::collections::HashMap;
use std::fs;
use std::io::{Read, Write};
use std::path::PathBuf;

use crate::models::index::LocalNovelIndexEntry;
use tauri::{AppHandle, Manager};

type LocalNovelIndex = HashMap<String, LocalNovelIndexEntry>;

const NOVEL_INDEX_FILENAME: &str = "novel_index.json";

/// 로컬 소설 인덱스 파일의 전체 절대 경로를 생성하여 반환합니다.
/// Tauri 2.x 방식: AppHandle의 path() 메서드를 통해 PathResolver를 얻고, app_local_data_dir() 사용
fn get_novel_index_file_path(app_handle: &AppHandle) -> Result<PathBuf, String> {
    // AppHandle의 path() 메서드를 사용하여 PathResolver 인스턴스를 가져옵니다.
    let mut path = app_handle
        .path() // PathResolver 인스턴스를 반환합니다.
        .app_local_data_dir() // PathResolver의 메서드를 사용하여 경로를 얻습니다.
        // app_local_data_dir()는 Result<PathBuf, tauri::Error>를 반환할 수 있으므로,
        // map_err를 사용하여 에러 타입을 String으로 변환합니다.
        .map_err(|e| {
            format!(
                "애플리케이션 로컬 데이터 디렉토리를 찾을 수 없습니다: {:?}",
                e
            )
        })?;

    // 해당 디렉토리 경로에 인덱스 파일 이름을 추가
    path.push(NOVEL_INDEX_FILENAME);
    Ok(path)
}

/// 로컬 소설 인덱스를 파일에서 읽어옵니다.
// AppHandle을 인자로 받도록 수정
pub fn load_index(app_handle: &AppHandle) -> Result<LocalNovelIndex, String> {
    // AppHandle을 전달하여 내부적으로 경로 해결 함수 호출
    let index_path = get_novel_index_file_path(app_handle)?;

    if !index_path.exists() {
        return Ok(HashMap::new());
    }

    let mut file_content = String::new();
    fs::File::open(&index_path)
        .map_err(|e| {
            format!(
                "인덱스 파일을 열 수 없습니다 (경로: {:?}): {}",
                index_path, e
            )
        })?
        .read_to_string(&mut file_content)
        .map_err(|e| format!("인덱스 파일 내용을 읽을 수 없습니다: {}", e))?;

    serde_json::from_str(&file_content)
        .map_err(|e| format!("인덱스 파일 JSON 파싱에 실패했습니다: {}", e))
}

/// 로컬 소설 인덱스 데이터를 파일에 저장합니다. (원자적 쓰기 방식)
// AppHandle을 인자로 받도록 수정
pub fn save_index(app_handle: &AppHandle, index_data: &LocalNovelIndex) -> Result<(), String> {
    let index_path = get_novel_index_file_path(app_handle)?;
    let parent_dir = index_path.parent().ok_or_else(|| {
        format!(
            "인덱스 파일의 부모 디렉토리를 찾을 수 없습니다: {:?}",
            index_path
        )
    })?;

    if !parent_dir.exists() {
        fs::create_dir_all(parent_dir).map_err(|e| {
            format!(
                "인덱스 파일 저장 디렉토리 생성에 실패했습니다 (경로: {:?}): {}",
                parent_dir, e
            )
        })?;
    }

    let temp_file_path = index_path.with_extension("json.tmp");

    let mut temp_file = fs::File::create(&temp_file_path).map_err(|e| {
        format!(
            "임시 인덱스 파일을 생성할 수 없습니다 (경로: {:?}): {}",
            temp_file_path, e
        )
    })?;

    let json_string = serde_json::to_string_pretty(index_data)
        .map_err(|e| format!("인덱스 데이터를 JSON으로 직렬화하는 데 실패했습니다: {}", e))?;

    temp_file
        .write_all(json_string.as_bytes())
        .map_err(|e| format!("임시 인덱스 파일에 쓰는 데 실패했습니다: {}", e))?;

    fs::rename(&temp_file_path, &index_path).map_err(|e| {
        format!(
            "인덱스 파일을 원자적으로 교체하는 데 실패했습니다 (원본: {:?}, 임시: {:?}): {}",
            index_path, temp_file_path, e
        )
    })?;

    Ok(())
}

/// 로컬 소설 인덱스에 특정 소설 항목을 추가하거나 기존 항목을 업데이트합니다.
// AppHandle을 인자로 받도록 수정
pub fn upsert_novel_entry(
    app_handle: &AppHandle,
    novel_id: String,
    entry: LocalNovelIndexEntry,
) -> Result<(), String> {
    let mut index = load_index(app_handle)?; // AppHandle 전달
    index.insert(novel_id, entry);
    save_index(app_handle, &index) // AppHandle 전달
}

/// 로컬 소설 인덱스에서 특정 소설 항목을 제거합니다.
// AppHandle을 인자로 받도록 수정
pub fn remove_novel_entry(app_handle: &AppHandle, novel_id: &str) -> Result<(), String> {
    let mut index = load_index(app_handle)?; // AppHandle 전달
    if index.remove(novel_id).is_some() {
        save_index(app_handle, &index) // AppHandle 전달
    } else {
        Ok(())
    }
}

/// 로컬 소설 인덱스에서 특정 소설 항목을 조회합니다.
// AppHandle을 인자로 받도록 수정
pub fn get_novel_entry(
    app_handle: &AppHandle,
    novel_id: &str,
) -> Result<Option<LocalNovelIndexEntry>, String> {
    let index = load_index(app_handle)?; // AppHandle 전달
    Ok(index.get(novel_id).cloned())
}

/// 로컬 소설 인덱스에 있는 모든 소설 항목의 목록을 반환합니다.
// AppHandle을 인자로 받도록 수정
pub fn get_all_novel_entries(app_handle: &AppHandle) -> Result<Vec<LocalNovelIndexEntry>, String> {
    let index = load_index(app_handle)?; // AppHandle 전달
    Ok(index.values().cloned().collect())
}
