use crate::models::snapshot::EpisodeSnapshot;
use crate::storage::episode_io::EPISODES_DIRNAME;
use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf}; // 기존 episodes 폴더명 사용

const SNAPSHOTS_SUBDIRNAME: &str = "snapshots"; // episodes 폴더 하위의 스냅샷 폴더명
const EPISODE_SNAPSHOT_FILE_EXTENSION: &str = "mvles"; // Muvel Episode Snapshot

/// 특정 에피소드의 스냅샷들이 저장될 디렉토리 경로를 반환합니다.
/// 예: {novel_root_path}/episodes/snapshots/{episode_id}/
fn get_episode_snapshots_dir_path(novel_root_path: &Path, episode_id: &str) -> PathBuf {
    novel_root_path
        .join(EPISODES_DIRNAME)
        .join(SNAPSHOTS_SUBDIRNAME)
        .join(episode_id)
}

/// 특정 스냅샷 파일의 전체 경로를 반환합니다.
/// 예: {novel_root_path}/episodes/snapshots/{episode_id}/{snapshot_id}.mvls
fn get_snapshot_file_path(novel_root_path: &Path, episode_id: &str, snapshot_id: &str) -> PathBuf {
    get_episode_snapshots_dir_path(novel_root_path, episode_id).join(format!(
        "{}.{}",
        snapshot_id, EPISODE_SNAPSHOT_FILE_EXTENSION
    ))
}

/// 특정 에피소드의 스냅샷 저장 디렉토리가 없으면 생성합니다.
pub fn ensure_episode_snapshots_directory_exists(
    novel_root_path: &Path,
    episode_id: &str,
) -> Result<PathBuf, String> {
    let dir_path = get_episode_snapshots_dir_path(novel_root_path, episode_id);
    if !dir_path.exists() {
        fs::create_dir_all(&dir_path).map_err(|e| {
            format!(
                "에피소드 스냅샷 디렉토리 생성 실패 (경로: {:?}): {}",
                dir_path, e
            )
        })?;
    }
    Ok(dir_path)
}

/// EpisodeSnapshot 데이터를 파일에 저장합니다.
pub fn write_snapshot_file(
    novel_root_path: &Path,
    episode_id: &str, // snapshot.episode_id와 동일해야 함
    snapshot: &EpisodeSnapshot,
) -> Result<(), String> {
    ensure_episode_snapshots_directory_exists(novel_root_path, episode_id)?;
    let snapshot_file_path = get_snapshot_file_path(novel_root_path, episode_id, &snapshot.id);

    let temp_file_path =
        snapshot_file_path.with_extension(&format!("{}.tmp", EPISODE_SNAPSHOT_FILE_EXTENSION));

    let mut temp_file = fs::File::create(&temp_file_path).map_err(|e| {
        format!(
            "임시 스냅샷 파일 생성 실패 (경로: {:?}): {}",
            temp_file_path, e
        )
    })?;
    let json_string = serde_json::to_string_pretty(snapshot)
        .map_err(|e| format!("스냅샷 데이터 JSON 직렬화 실패: {}", e))?;
    temp_file
        .write_all(json_string.as_bytes())
        .map_err(|e| format!("임시 스냅샷 파일 쓰기 실패: {}", e))?;
    fs::rename(&temp_file_path, &snapshot_file_path)
        .map_err(|e| format!("스냅샷 파일 원자적 교체 실패: {}", e))?;
    Ok(())
}

/// 스냅샷 파일 내용을 읽어 EpisodeSnapshot 객체로 반환합니다.
fn read_snapshot_file_content(snapshot_file_path: &Path) -> Result<EpisodeSnapshot, String> {
    if !snapshot_file_path.exists() {
        return Err(format!(
            "스냅샷 파일을 찾을 수 없습니다: {:?}",
            snapshot_file_path
        ));
    }
    let mut file_content = String::new();
    fs::File::open(snapshot_file_path)
        .map_err(|e| {
            format!(
                "스냅샷 파일 열기 실패 (경로: {:?}): {}",
                snapshot_file_path, e
            )
        })?
        .read_to_string(&mut file_content)
        .map_err(|e| format!("스냅샷 파일 읽기 실패: {}", e))?;
    serde_json::from_str(&file_content).map_err(|e| {
        format!(
            "스냅샷 파일 JSON 파싱 실패 (경로: {:?}): {}",
            snapshot_file_path, e
        )
    })
}

/// 특정 에피소드에 속한 모든 스냅샷 파일들을 읽어 Vec<EpisodeSnapshot>으로 반환합니다.
/// 생성 시각(createdAt) 기준으로 정렬하여 반환할 수 있습니다 (여기서는 파일시스템 순서).
pub fn list_snapshots_for_episode(
    novel_root_path: &Path,
    episode_id: &str,
) -> Result<Vec<EpisodeSnapshot>, String> {
    let snapshots_dir = get_episode_snapshots_dir_path(novel_root_path, episode_id);
    let mut snapshots = Vec::new();

    if !snapshots_dir.exists() || !snapshots_dir.is_dir() {
        return Ok(snapshots); // 스냅샷 폴더가 없으면 빈 목록 반환
    }

    for entry in fs::read_dir(&snapshots_dir).map_err(|e| {
        format!(
            "스냅샷 디렉토리 읽기 실패 (경로: {:?}): {}",
            snapshots_dir, e
        )
    })? {
        let entry = entry.map_err(|e| format!("디렉토리 항목 읽기 실패: {}", e))?;
        let path = entry.path();

        if path.is_file()
            && path
                .extension()
                .map_or(false, |ext| ext == EPISODE_SNAPSHOT_FILE_EXTENSION)
        {
            match read_snapshot_file_content(&path) {
                Ok(snapshot) => snapshots.push(snapshot),
                Err(e) => {
                    // 개별 파일 읽기/파싱 실패 시 로그만 남기고 계속 진행할 수 있음
                    eprintln!("스냅샷 파일 처리 중 오류 (파일: {:?}): {}", path, e);
                }
            }
        }
    }
    // 생성 시간 기준으로 정렬 (오래된 순 -> 최신 순)
    snapshots.sort_by(|a, b| a.created_at.cmp(&b.created_at));
    Ok(snapshots)
}
