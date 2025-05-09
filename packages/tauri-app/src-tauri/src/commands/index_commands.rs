// src-tauri/src/commands/index_commands.rs

use std::path::{Path, PathBuf};
// tauri::command 어트리뷰트를 사용하여 함수를 Tauri 커맨드로 만듭니다.
// AppHandle을 사용하여 애플리케이션의 상태나 설정에 접근합니다.
use tauri::{command, AppHandle};
// State와 Runtime은 필요시 사용

// crate::models 모듈의 LocalNovelIndexEntry 구조체를 사용합니다.
use crate::models::LocalNovelIndexEntry;
// crate::storage::index_manager 모듈의 함수들을 사용합니다.
use crate::storage::index_manager;

// TypeScript의 `getAllLocalNovelEntries` 함수에 대응하는 Tauri 커맨드입니다.
// 프론트엔드에서 `invoke("get_all_local_novel_entries_command")` 형태로 호출될 수 있습니다.
// AppHandle을 인자로 받아 index_manager의 함수에 전달합니다.
#[command]
pub fn get_all_local_novel_entries_command(
    app_handle: AppHandle,
) -> Result<Vec<LocalNovelIndexEntry>, String> {
    // index_manager의 get_all_novel_entries 함수를 호출합니다.
    // 이 함수는 Result<Vec<LocalNovelIndexEntry>, String>을 반환하므로,
    // 에러가 발생하면 `?` 연산자를 통해 자동으로 전파되거나, 여기서 직접 처리할 수 있습니다.
    index_manager::get_all_novel_entries(&app_handle)
        .map_err(|e| {
            // 에러 발생 시 로깅을 추가하거나 에러 메시지를 가공할 수 있습니다.
            eprintln!("Error in get_all_local_novel_entries_command: {}", e);
            e // 원래 에러 메시지를 그대로 반환
        })
}

// TypeScript의 `getLocalNovelEntry` 함수에 대응하는 Tauri 커맨드입니다.
#[command]
pub fn get_local_novel_entry_command(
    app_handle: AppHandle,
    novel_id: String, // 프론트엔드에서 novelId를 문자열로 받습니다.
) -> Result<Option<LocalNovelIndexEntry>, String> {
    index_manager::get_novel_entry(&app_handle, &novel_id) // &novel_id로 참조 전달
        .map_err(|e| {
            eprintln!("Error in get_local_novel_entry_command for novel_id {}: {}", novel_id, e);
            e
        })
}

// TypeScript의 `registerNovelFromPath` 함수에 대응하는 Tauri 커맨드입니다.
// 이 커맨드는 파일 경로를 받아 해당 소설을 인덱스에 등록(또는 업데이트)합니다.
#[command]
pub fn register_novel_from_path_command(
    app_handle: AppHandle,
    file_path: String, // 프론트엔드에서 파일 경로를 문자열로 받습니다.
) -> Result<Option<String>, String> { // 성공 시 novel_id (Option) 반환, 실패 시 에러
    // 이 커맨드의 실제 로직은 좀 더 복잡할 수 있습니다.
    // 1. file_path에서 novel_id (UUID)를 추출하거나 .muvl 파일을 읽어 가져옵니다.
    // 2. 해당 novel_id와 file_path(의 디렉토리)를 index_manager::upsert_novel_entry를 사용해 인덱스에 저장합니다.
    // 여기서는 개념적인 예시로, 실제 구현은 storage 모듈 내에 더 많은 로직이 필요할 수 있습니다.

    // 임시 로직: 실제로는 파일 시스템 접근 및 파싱 필요
    // 예를 들어, file_path가 novel-id.muvl 형태라고 가정하거나,
    // file_path의 내용을 읽어 id를 추출해야 합니다.
    // 여기서는 file_path 자체가 novel_id라고 가정하고 인덱스에 추가하는 단순 예시를 들겠습니다.
    // 실제로는 이 로직을 storage 모듈에 구현하고 호출해야 합니다.

    // 예시: file_path가 실제 소설 루트 경로라고 가정하고,
    // 해당 경로에서 novel-id.muvl을 찾아 ID를 얻고, LocalNovelIndexEntry를 만들어 upsert
    // 이 부분은 novel_io.rs 에 관련 함수를 만들고 호출하는 것이 더 적절합니다.
    // 지금은 개념만 보여드리기 위해 간략화합니다.

    // 실제 구현에서는 아래와 같은 흐름이 될 것입니다:
    // 1. `filePath` (e.g., a .muvl file)를 분석하여 소설 루트 경로와 소설 ID를 알아냅니다.
    //    (예: `storage::novel_io::get_novel_id_and_root_from_muvl_path(&file_path)`)
    // 2. 알아낸 정보로 `LocalNovelIndexEntry`를 생성합니다.
    //    (예: `let entry = LocalNovelIndexEntry { id: novel_id.clone(), title: novel_title, path: Some(novel_root_path.to_string()), ... };`)
    // 3. `index_manager::upsert_novel_entry`를 호출합니다.
    //    (예: `index_manager::upsert_novel_entry(&app_handle, novel_id.clone(), entry)`)

    // 아래는 매우 단순화된 예시이며, 실제로는 위와 같은 처리가 필요합니다.
    // 이 커맨드는 프론트엔드의 registerNovelFromPath와 1:1 대응보다는,
    // 프론트엔드가 경로를 주면, Rust가 알아서 파싱하고 인덱싱하는 역할로 설계되어야 합니다.
    let novel_id_from_path = PathBuf::from(&file_path)
        .file_stem() // 파일명 (확장자 제외)
        .and_then(|stem| stem.to_str())
        .map(|s| s.to_string());

    if let Some(id) = novel_id_from_path {
        // 실제로는 LocalNovelIndexEntry를 제대로 만들어서 넣어야 합니다.
        // 여기서는 title과 path를 임의로 설정합니다.
        let entry = LocalNovelIndexEntry {
            id: id.clone(),
            title: format!("소설: {}", id), // 실제로는 .muvl에서 읽어야 함
            path: Some( // 실제로는 file_path의 부모 디렉토리 경로
                        PathBuf::from(&file_path)
                            .parent()
                            .unwrap_or_else(|| Path::new(""))
                            .to_str()
                            .unwrap_or("")
                            .to_string()
            ),
            episode_count: None,
            thumbnail: None,
            last_opened: None,
        };
        match index_manager::upsert_novel_entry(&app_handle, id.clone(), entry) {
            Ok(_) => Ok(Some(id)),
            Err(e) => Err(format!("인덱스 등록/업데이트 실패: {}", e)),
        }
    } else {
        Err("파일 경로에서 소설 ID를 추출할 수 없습니다.".to_string())
    }
}


// TypeScript의 `removeNovelDataAndFromIndex` 함수에 대응하는 Tauri 커맨드입니다.
// 이 커맨드는 인덱스에서 항목을 제거하고, 관련 파일/폴더도 삭제합니다.
#[command]
pub fn remove_novel_project_command(
    app_handle: AppHandle,
    novel_id: String,
) -> Result<(), String> {
    // 1. 인덱스에서 해당 novel_id의 경로(novel_root_path)를 가져옵니다.
    let entry_opt = index_manager::get_novel_entry(&app_handle, &novel_id)?;

    if let Some(entry) = entry_opt {
        if let Some(novel_root_str) = entry.path {
            let novel_root_path = PathBuf::from(novel_root_str);
            // 2. storage::novel_io 를 사용하여 실제 파일/폴더를 삭제합니다.
            //    (novel_io.rs 에 delete_novel_project_directory 함수가 정의되어 있다고 가정)
            crate::storage::novel_io::delete_novel_project_directory(&novel_root_path)?;

            // 3. 파일/폴더 삭제 성공 시, 인덱스에서도 해당 항목을 제거합니다.
            index_manager::remove_novel_entry(&app_handle, &novel_id)?;
            Ok(())
        } else {
            // 경로 정보가 없는 경우, 인덱스에서만 제거 시도 (파일은 못 찾음)
            index_manager::remove_novel_entry(&app_handle, &novel_id)?;
            Err(format!("소설 ID {} 에 대한 경로 정보가 인덱스에 없어 파일은 삭제하지 못했지만, 인덱스에서는 제거 시도했습니다.", novel_id))
        }
    } else {
        Err(format!("삭제할 소설 ID {} 를 인덱스에서 찾을 수 없습니다.", novel_id))
    }
}
