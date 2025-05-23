use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::io::{Read, Write};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const DEFAULT_ITEM_TYPE: &str = "episode";

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ItemEntry {
    pub novel_id: String,
    pub item_type: String,
}

type ItemToNovelMap = HashMap<String, ItemEntry>;

const ITEM_TO_NOVEL_MAP_FILENAME: &str = "novel_item_index.json";

fn get_item_map_file_path(app_handle: &AppHandle) -> Result<PathBuf, String> {
    // app_local_data_dir() 자체가 Result를 반환하므로, 그 결과에 join을 체이닝하고 최종적으로 Ok로 감쌉니다.
    let path = app_handle
        .path()
        .app_local_data_dir()
        .map_err(|e| {
            format!(
                "애플리케이션 로컬 데이터 디렉토리를 찾을 수 없습니다: {:?}",
                e
            )
        })?
        .join(ITEM_TO_NOVEL_MAP_FILENAME); // PathBuf를 반환
    Ok(path) // PathBuf를 Result로 감싸줍니다.
}

pub fn load_item_map(app_handle: &AppHandle) -> Result<ItemToNovelMap, String> {
    let map_path = get_item_map_file_path(app_handle)?;

    if !map_path.exists() {
        return Ok(HashMap::new());
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

    match serde_json::from_str::<ItemToNovelMap>(&file_content) {
        Ok(map) => Ok(map),
        Err(_) => match serde_json::from_str::<HashMap<String, String>>(&file_content) {
            Ok(old_map) => {
                eprintln!("이전 버전의 item_to_novel_map.json 파일을 로드했습니다. 새 포맷으로 변환합니다.");
                let new_map: ItemToNovelMap = old_map
                    .into_iter()
                    .map(|(item_id, novel_id)| {
                        (
                            item_id,
                            ItemEntry {
                                novel_id,
                                item_type: DEFAULT_ITEM_TYPE.to_string(),
                            },
                        )
                    })
                    .collect();
                if let Err(e) = save_item_map(app_handle, &new_map) {
                    eprintln!("아이템 맵 자동 마이그레이션 저장 실패: {}", e);
                }
                Ok(new_map)
            }
            Err(e) => Err(format!(
                "아이템 맵 파일 JSON 파싱에 실패했습니다 (두 포맷 모두 실패): {}",
                e
            )),
        },
    }
}

pub fn save_item_map(app_handle: &AppHandle, map_data: &ItemToNovelMap) -> Result<(), String> {
    let map_path = get_item_map_file_path(app_handle)?;
    let parent_dir = map_path.parent().ok_or_else(|| {
        format!(
            "아이템 맵 파일의 부모 디렉토리를 찾을 수 없습니다: {:?}",
            map_path
        )
    })?;

    if !parent_dir.exists() {
        fs::create_dir_all(parent_dir)
            .map_err(|e| format!("아이템 맵 파일 저장 디렉토리 생성 실패: {}", e))?;
    }

    let temp_file_path = map_path.with_extension("json.tmp");
    let mut temp_file = fs::File::create(&temp_file_path)
        .map_err(|e| format!("임시 아이템 맵 파일 생성 실패: {}", e))?;
    let json_string = serde_json::to_string_pretty(map_data)
        .map_err(|e| format!("아이템 맵 데이터 JSON 직렬화 실패: {}", e))?;
    temp_file
        .write_all(json_string.as_bytes())
        .map_err(|e| format!("임시 아이템 맵 파일 쓰기 실패: {}", e))?;
    fs::rename(&temp_file_path, &map_path)
        .map_err(|e| format!("아이템 맵 파일 원자적 교체 실패: {}", e))?;
    Ok(())
}

pub fn upsert_item_novel_mapping(
    app_handle: &AppHandle,
    item_id: String,
    novel_id: String,
    item_type: String,
) -> Result<(), String> {
    let mut map = load_item_map(app_handle)?;
    map.insert(
        item_id,
        ItemEntry {
            novel_id,
            item_type,
        },
    );
    save_item_map(app_handle, &map)
}

pub fn remove_item_novel_mapping(app_handle: &AppHandle, item_id: &str) -> Result<(), String> {
    let mut map = load_item_map(app_handle)?;
    if map.remove(item_id).is_some() {
        save_item_map(app_handle, &map)
    } else {
        Ok(())
    }
}

pub fn get_item_entry(app_handle: &AppHandle, item_id: &str) -> Result<Option<ItemEntry>, String> {
    let map = load_item_map(app_handle)?;
    Ok(map.get(item_id).cloned())
}

/// 특정 아이템 ID에 해당하는 부모 소설 ID만을 조회합니다.
/// 이 함수는 리포지토리에서 `get_item_entry`를 직접 사용하는 것으로 대체될 수 있습니다.
/// 하지만 명시적으로 이 함수가 필요하다면 유지합니다.
pub fn get_novel_id_for_item(
    // 이 함수 시그니처를 리포지토리에서 사용한다고 가정하고 유지
    app_handle: &AppHandle,
    item_id: &str,
) -> Result<Option<String>, String> {
    get_item_entry(app_handle, item_id).map(|opt_entry| opt_entry.map(|entry| entry.novel_id))
}

pub fn get_item_ids_for_novel_by_type(
    app_handle: &AppHandle,
    target_novel_id: &str,
    target_item_type: &str,
) -> Result<Vec<String>, String> {
    let map = load_item_map(app_handle)?;
    let item_ids: Vec<String> = map
        .into_iter()
        .filter(|(_item_id, entry)| {
            entry.novel_id == target_novel_id && entry.item_type == target_item_type
        })
        .map(|(item_id, _entry)| item_id)
        .collect();
    Ok(item_ids)
}

#[allow(dead_code)]
pub fn get_all_item_ids_for_novel(
    app_handle: &AppHandle,
    target_novel_id: &str,
) -> Result<Vec<String>, String> {
    let map = load_item_map(app_handle)?;
    let item_ids: Vec<String> = map
        .into_iter()
        .filter(|(_item_id, entry)| entry.novel_id == target_novel_id)
        .map(|(item_id, _entry)| item_id)
        .collect();
    Ok(item_ids)
}
