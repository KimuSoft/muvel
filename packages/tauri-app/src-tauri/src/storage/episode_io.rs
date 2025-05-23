use crate::models::enums::episode_type::EpisodeType; // 기본값을 위해 필요
use crate::models::episode::LocalEpisodeData;
use crate::models::novel::EpisodeSummaryData; // EpisodeSummaryData 사용
use serde::Deserialize; // 부분 역직렬화를 위해 필요
use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};

// 에피소드 파일들을 저장할 폴더 이름 (novel_io.rs와 일관성 유지)
pub const EPISODES_DIRNAME: &str = "episodes";
// 에피소드 파일의 확장자
const EPISODE_FILE_EXTENSION: &str = "mvle";

/// 주어진 소설 루트 경로와 에피소드 ID를 사용하여 에피소드 파일의 전체 경로를 구성합니다.
fn get_episode_file_path(novel_root_path: &Path, episode_id: &str) -> PathBuf {
    novel_root_path
        .join(EPISODES_DIRNAME)
        .join(format!("{}.{}", episode_id, EPISODE_FILE_EXTENSION))
}

/// 특정 로컬 에피소드 파일(.mvle)을 읽어 LocalEpisodeData 객체로 반환합니다.
/// (이 함수는 전체 에피소드 데이터를 읽습니다.)
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

    serde_json::from_str(&file_content).map_err(|e| {
        format!(
            "에피소드 파일 JSON 파싱에 실패했습니다 (ID: {}): {}",
            episode_id, e
        )
    })
}

/// LocalEpisodeData 객체를 에피소드 파일(.mvle)에 저장(업데이트)합니다.
pub fn write_episode_content(
    novel_root_path: &Path,
    episode_id: &str,
    data: &LocalEpisodeData,
) -> Result<(), String> {
    let episode_file_path = get_episode_file_path(novel_root_path, episode_id);
    let parent_dir = episode_file_path.parent().ok_or_else(|| {
        format!(
            "에피소드 파일의 부모 디렉토리를 찾을 수 없습니다: {:?}",
            episode_file_path
        )
    })?;

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
        // 파일이 없어도 오류는 아님 (이미 삭제되었을 수 있음)
        println!(
            "삭제할 에피소드 파일이 존재하지 않거나 파일이 아닙니다: {:?}",
            episode_file_path
        );
        Ok(())
    }
}

/// 에피소드 파일에서 요약 정보만 읽기 위한 임시 구조체 (부분 역직렬화용)
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct PartialEpisodeDataForSummary {
    id: String,
    title: String,
    order: f32,
    episode_type: EpisodeType,
    #[serde(default)] // contentLength가 파일에 없을 경우 기본값 사용 (0)
    content_length: Option<i32>, // LocalEpisodeData에서는 필수지만, 요약본 읽을 때는 없을 수도 있음
    created_at: String,
    updated_at: String,
    // blocks, flowDoc 등 용량이 큰 필드는 여기에 포함하지 않음
}

/// 특정 소설의 `episodes` 디렉토리 내 모든 에피소드 파일에서 요약 정보만 읽어 목록으로 반환합니다.
/// 용량이 큰 `blocks`, `flowDoc` 필드는 읽지 않습니다 (부분 역직렬화).
pub fn list_episode_summaries_from_files(
    novel_root_path: &Path,
) -> Result<Vec<EpisodeSummaryData>, String> {
    let episodes_dir_path = novel_root_path.join(EPISODES_DIRNAME);
    let mut episode_summaries = Vec::new();

    if !episodes_dir_path.exists() || !episodes_dir_path.is_dir() {
        return Ok(episode_summaries); // 에피소드 폴더가 없으면 빈 목록 반환
    }

    for entry in fs::read_dir(&episodes_dir_path).map_err(|e| {
        format!(
            "에피소드 디렉토리를 읽을 수 없습니다 (경로: {:?}): {}",
            episodes_dir_path, e
        )
    })? {
        let entry = entry.map_err(|e| format!("디렉토리 항목 읽기 실패: {}", e))?;
        let path = entry.path();

        if path.is_file()
            && path
                .extension()
                .map_or(false, |ext| ext == EPISODE_FILE_EXTENSION)
        {
            let mut file_content = String::new();
            if fs::File::open(&path)
                .and_then(|mut f| f.read_to_string(&mut file_content))
                .is_err()
            {
                eprintln!("에피소드 요약 읽기 실패 (파일 열기/읽기 오류): {:?}", path);
                continue; // 다음 파일로 넘어감
            }

            match serde_json::from_str::<PartialEpisodeDataForSummary>(&file_content) {
                Ok(partial_data) => {
                    episode_summaries.push(EpisodeSummaryData {
                        id: partial_data.id,
                        title: partial_data.title,
                        order: partial_data.order,
                        episode_type: partial_data.episode_type,
                        content_length: partial_data.content_length.or(Some(0)), // 파일에 없으면 0으로
                        created_at: partial_data.created_at,
                        updated_at: partial_data.updated_at,
                    });
                }
                Err(e) => {
                    eprintln!(
                        "에피소드 요약 정보 JSON 파싱 실패 (파일: {:?}): {}. 건너<0xEB><0><0x88>니다.",
                        path, e
                    );
                    // 파싱 실패 시 해당 파일은 건너<0xEB><0><0x88>니다.
                }
            }
        }
    }
    // 순서(order)에 따라 정렬
    episode_summaries.sort_by(|a, b| {
        a.order
            .partial_cmp(&b.order)
            .unwrap_or(std::cmp::Ordering::Equal)
    });
    Ok(episode_summaries)
}
