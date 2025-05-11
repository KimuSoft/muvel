use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use tauri::{command, AppHandle};
use uuid::Uuid;

const RESOURCES_DIRNAME: &str = "resources";
const IMAGES_SUBDIR_IN_RESOURCES: &str = "images";

/// 특정 소설의 'resources/images' 디렉토리에 이미지를 저장하고 절대 경로를 반환합니다.
///
/// # Arguments
/// * `app_handle` - Tauri AppHandle.
/// * `novel_id` - 이미지를 저장할 대상 소설의 ID.
/// * `original_file_name` - 원본 파일 이름 (확장자 추출용).
/// * `file_bytes` - 이미지 파일의 바이트 데이터.
///
/// # Returns
/// * `Result<String, String>` - 성공 시 저장된 파일의 절대 경로, 실패 시 에러 메시지.
#[command]
pub fn save_image_to_novel_resources_command(
    app_handle: AppHandle,
    novel_id: String,
    original_file_name: String,
    file_bytes: Vec<u8>,
) -> Result<String, String> {
    let novel_entry = crate::storage::index_manager::get_novel_entry(&app_handle, &novel_id)
        .map_err(|e| format!("소설 인덱스 조회 실패 (ID: {}): {}", novel_id, e))?
        .ok_or_else(|| {
            format!(
                "소설 ID '{}'에 해당하는 프로젝트를 찾을 수 없습니다.",
                novel_id
            )
        })?;

    let novel_root_path_str = novel_entry.path.ok_or_else(|| {
        format!(
            "소설 ID '{}'의 프로젝트 경로가 인덱스에 설정되지 않았습니다.",
            novel_id
        )
    })?;
    let novel_root_path = PathBuf::from(novel_root_path_str);

    // 2. 대상 디렉토리 경로 구성: {novel_root_path}/resources/images/
    let images_dir = novel_root_path
        .join(RESOURCES_DIRNAME)
        .join(IMAGES_SUBDIR_IN_RESOURCES);

    // 3. 전체 디렉토리 경로 생성 (없는 경우)
    //    novel_io::create_novel_directories 에서 이미 resources 폴더가 생성되었을 수 있지만,
    //    images 하위 폴더까지 확실히 생성하기 위해 여기서 한 번 더 호출합니다.
    fs::create_dir_all(&images_dir).map_err(|e| {
        format!(
            "이미지 저장 디렉토리 생성 실패 ('{}'): {}",
            images_dir.display(),
            e
        )
    })?;

    // 4. 고유한 파일명 생성 (UUID + 원본 확장자)
    let original_path = Path::new(&original_file_name);
    let extension = original_path
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("png"); // 확장자가 없으면 기본으로 png 사용 (또는 에러 처리)

    let unique_filename = format!("{}.{}", Uuid::new_v4(), extension);
    let target_file_path = images_dir.join(&unique_filename);

    // 5. 파일 저장
    let mut file = fs::File::create(&target_file_path).map_err(|e| {
        format!(
            "이미지 파일 생성 실패 ('{}'): {}",
            target_file_path.display(),
            e
        )
    })?;

    file.write_all(&file_bytes).map_err(|e| {
        format!(
            "이미지 파일 쓰기 실패 ('{}'): {}",
            target_file_path.display(),
            e
        )
    })?;

    // 6. 저장된 파일의 절대 경로 문자열로 변환하여 반환
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
