use std::collections::HashMap;
use std::fs;
use std::io::{Read, Write};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

// 아이템 ID(String)를 키로, 부모 소설 ID(String)를 값으로 가지는 해시맵입니다.
type ItemToNovelMap = HashMap<String, String>;

// 아이템-소설 ID 매핑 정보를 저장할 파일의 이름입니다.
const ITEM_TO_NOVEL_MAP_FILENAME: &str = "item_to_novel_map.json";

/// 아이템-소설 ID 맵 파일의 전체 절대 경로를 생성하여 반환합니다.
/// index_manager.rs의 get_novel_index_file_path와 동일한 방식으로 경로를 얻습니다.
fn get_item_map_file_path(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let mut path = app_handle
        .path() // PathResolver 인스턴스를 반환합니다.
        .app_local_data_dir() // PathResolver의 메서드를 사용하여 경로를 얻습니다.
        .map_err(|e| {
            format!(
                "애플리케이션 로컬 데이터 디렉토리를 찾을 수 없습니다 (아이템 맵용): {:?}",
                e
            )
        })?;

    path.push(ITEM_TO_NOVEL_MAP_FILENAME);
    Ok(path)
}

/// 아이템-소설 ID 맵을 파일에서 읽어옵니다.
pub fn load_item_map(app_handle: &AppHandle) -> Result<ItemToNovelMap, String> {
    let map_path = get_item_map_file_path(app_handle)?;

    if !map_path.exists() {
        return Ok(HashMap::new()); // 파일 없으면 빈 맵
    }

    let mut file_content = String::new();
    fs::File::open(&map_path)
        .map_err(|e| {
            format!(
                "아이템 맵 파일을 열 수 없습니다 (경로: {:?}): {}",
                map_path, e
            )
        })?
        .read_to_string(&mut file_content)
        .map_err(|e| format!("아이템 맵 파일 내용을 읽을 수 없습니다: {}", e))?;

    serde_json::from_str(&file_content)
        .map_err(|e| format!("아이템 맵 파일 JSON 파싱에 실패했습니다: {}", e))
}

/// 아이템-소설 ID 맵 데이터를 파일에 저장합니다. (원자적 쓰기 방식)
pub fn save_item_map(app_handle: &AppHandle, map_data: &ItemToNovelMap) -> Result<(), String> {
    let map_path = get_item_map_file_path(app_handle)?;
    let parent_dir = map_path.parent().ok_or_else(|| {
        format!(
            "아이템 맵 파일의 부모 디렉토리를 찾을 수 없습니다: {:?}",
            map_path
        )
    })?;

    if !parent_dir.exists() {
        fs::create_dir_all(parent_dir).map_err(|e| {
            format!(
                "아이템 맵 파일 저장 디렉토리 생성에 실패했습니다 (경로: {:?}): {}",
                parent_dir, e
            )
        })?;
    }

    let temp_file_path = map_path.with_extension("json.tmp");

    let mut temp_file = fs::File::create(&temp_file_path).map_err(|e| {
        format!(
            "임시 아이템 맵 파일을 생성할 수 없습니다 (경로: {:?}): {}",
            temp_file_path, e
        )
    })?;

    let json_string = serde_json::to_string_pretty(map_data).map_err(|e| {
        format!(
            "아이템 맵 데이터를 JSON으로 직렬화하는 데 실패했습니다: {}",
            e
        )
    })?;

    temp_file
        .write_all(json_string.as_bytes())
        .map_err(|e| format!("임시 아이템 맵 파일에 쓰는 데 실패했습니다: {}", e))?;

    fs::rename(&temp_file_path, &map_path).map_err(|e| {
        format!(
            "아이템 맵 파일을 원자적으로 교체하는 데 실패했습니다 (원본: {:?}, 임시: {:?}): {}",
            map_path, temp_file_path, e
        )
    })?;

    Ok(())
}

/// 아이템-소설 ID 맵에 특정 아이템과 부모 소설 ID의 매핑을 추가하거나 업데이트합니다.
pub fn upsert_item_novel_mapping(
    app_handle: &AppHandle,
    item_id: String,
    novel_id: String,
) -> Result<(), String> {
    let mut map = load_item_map(app_handle)?;
    map.insert(item_id, novel_id);
    save_item_map(app_handle, &map)
}

/// 아이템-소설 ID 맵에서 특정 아이템 ID의 매핑을 제거합니다.
pub fn remove_item_novel_mapping(app_handle: &AppHandle, item_id: &str) -> Result<(), String> {
    let mut map = load_item_map(app_handle)?;
    if map.remove(item_id).is_some() {
        save_item_map(app_handle, &map)
    } else {
        Ok(())
    }
}

/// 특정 아이템 ID에 해당하는 부모 소설 ID를 조회합니다.
pub fn get_novel_id_for_item(
    app_handle: &AppHandle,
    item_id: &str,
) -> Result<Option<String>, String> {
    let map = load_item_map(app_handle)?;
    Ok(map.get(item_id).cloned())
}

/// 특정 소설 ID에 속한 모든 아이템 ID들의 목록을 반환합니다.
/// (주의: 이 함수는 전체 맵을 순회하므로 아이템 수가 매우 많으면 비효율적일 수 있습니다.)
pub fn get_item_ids_for_novel(
    app_handle: &AppHandle,
    novel_id: &str,
) -> Result<Vec<String>, String> {
    let map = load_item_map(app_handle)?;
    let item_ids: Vec<String> = map
        .iter()
        .filter(|&(_item_id, mapped_novel_id)| mapped_novel_id == novel_id)
        .map(|(item_id, _mapped_novel_id)| item_id.clone())
        .collect();
    Ok(item_ids)
}
