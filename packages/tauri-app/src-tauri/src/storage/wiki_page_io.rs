use crate::models::novel::WikiPageSummaryData; // WikiPageSummaryData 사용
use crate::models::wiki_page::{WikiPage, WikiPageCategory}; // WikiPage 모델 사용
use serde::Deserialize; // 부분 역직렬화를 위해 필요
use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};

// 위키 페이지 파일들을 저장할 폴더 이름
pub const WIKI_PAGES_DIRNAME: &str = "wiki"; // 예시 폴더명
                                             // 위키 페이지 파일의 확장자
const WIKI_PAGE_FILE_EXTENSION: &str = "mvlw"; // Muvel Wiki Page

/// 주어진 소설 루트 경로와 위키 페이지 ID를 사용하여 위키 페이지 파일의 전체 경로를 구성합니다.
fn get_wiki_page_file_path(novel_root_path: &Path, page_id: &str) -> PathBuf {
    novel_root_path
        .join(WIKI_PAGES_DIRNAME)
        .join(format!("{}.{}", page_id, WIKI_PAGE_FILE_EXTENSION))
}

/// 위키 페이지 저장 디렉토리를 생성합니다. (없을 경우)
pub fn ensure_wiki_pages_directory_exists(novel_root_path: &Path) -> Result<PathBuf, String> {
    let wiki_pages_dir = novel_root_path.join(WIKI_PAGES_DIRNAME);
    if !wiki_pages_dir.exists() {
        fs::create_dir_all(&wiki_pages_dir).map_err(|e| {
            format!(
                "위키 페이지 디렉토리 생성 실패 (경로: {:?}): {}",
                wiki_pages_dir, e
            )
        })?;
    }
    Ok(wiki_pages_dir)
}

/// 특정 위키 페이지 파일(.mkwp)을 읽어 WikiPage 객체로 반환합니다.
pub fn read_wiki_page_content(novel_root_path: &Path, page_id: &str) -> Result<WikiPage, String> {
    let page_file_path = get_wiki_page_file_path(novel_root_path, page_id);

    if !page_file_path.exists() {
        return Err(format!(
            "위키 페이지 파일을 찾을 수 없습니다: {:?}",
            page_file_path
        ));
    }

    let mut file_content = String::new();
    fs::File::open(&page_file_path)
        .map_err(|e| {
            format!(
                "위키 페이지 파일을 열 수 없습니다 (경로: {:?}): {}",
                page_file_path, e
            )
        })?
        .read_to_string(&mut file_content)
        .map_err(|e| format!("위키 페이지 파일 내용을 읽을 수 없습니다: {}", e))?;

    serde_json::from_str(&file_content).map_err(|e| {
        format!(
            "위키 페이지 파일 JSON 파싱에 실패했습니다 (ID: {}): {}",
            page_id, e
        )
    })
}

/// WikiPage 객체를 위키 페이지 파일(.mkwp)에 저장(업데이트)합니다.
pub fn write_wiki_page_content(
    novel_root_path: &Path,
    page_id: &str, // page_id는 data.id와 동일해야 함
    data: &WikiPage,
) -> Result<(), String> {
    ensure_wiki_pages_directory_exists(novel_root_path)?; // 디렉토리 존재 확인 및 생성
    let page_file_path = get_wiki_page_file_path(novel_root_path, page_id);

    let temp_file_path =
        page_file_path.with_extension(&format!("{}.tmp", WIKI_PAGE_FILE_EXTENSION));

    let mut temp_file = fs::File::create(&temp_file_path).map_err(|e| {
        format!(
            "임시 위키 페이지 파일을 생성할 수 없습니다 (경로: {:?}): {}",
            temp_file_path, e
        )
    })?;

    let json_string = serde_json::to_string_pretty(data).map_err(|e| {
        format!(
            "위키 페이지 데이터를 JSON으로 직렬화하는 데 실패했습니다: {}",
            e
        )
    })?;

    temp_file
        .write_all(json_string.as_bytes())
        .map_err(|e| format!("임시 위키 페이지 파일에 쓰는 데 실패했습니다: {}", e))?;

    fs::rename(&temp_file_path, &page_file_path).map_err(|e| {
        format!(
            "위키 페이지 파일을 원자적으로 교체하는 데 실패했습니다 (원본: {:?}, 임시: {:?}): {}",
            page_file_path, temp_file_path, e
        )
    })?;

    Ok(())
}

/// 특정 위키 페이지 파일(.mkwp)을 삭제합니다.
pub fn delete_wiki_page_file(novel_root_path: &Path, page_id: &str) -> Result<(), String> {
    let page_file_path = get_wiki_page_file_path(novel_root_path, page_id);

    if page_file_path.exists() && page_file_path.is_file() {
        fs::remove_file(&page_file_path).map_err(|e| {
            format!(
                "위키 페이지 파일 삭제에 실패했습니다 (경로: {:?}): {}",
                page_file_path, e
            )
        })?;
        Ok(())
    } else {
        println!(
            "삭제할 위키 페이지 파일이 존재하지 않거나 파일이 아닙니다: {:?}",
            page_file_path
        );
        Ok(())
    }
}

/// 위키 페이지 파일에서 요약 정보만 읽기 위한 임시 구조체 (부분 역직렬화용)
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct PartialWikiPageDataForSummary {
    id: String,
    title: String,
    #[serde(default)]
    category: Option<WikiPageCategory>,
    #[serde(default)]
    thumbnail: Option<String>,
    updated_at: String,
    // tags, summary, attributes 등은 요약 정보에서 제외 가능 (필요시 추가)
}

/// 특정 소설의 `wiki` 디렉토리 내 모든 위키 페이지 파일에서 요약 정보만 읽어 목록으로 반환합니다.
pub fn list_wiki_page_summaries_from_files(
    novel_root_path: &Path,
) -> Result<Vec<WikiPageSummaryData>, String> {
    let wiki_pages_dir_path = ensure_wiki_pages_directory_exists(novel_root_path)?;
    let mut page_summaries = Vec::new();

    if !wiki_pages_dir_path.is_dir() {
        // ensure_wiki_pages_directory_exists가 생성하므로 이 조건은 거의 발생 안함
        return Ok(page_summaries);
    }

    for entry in fs::read_dir(&wiki_pages_dir_path).map_err(|e| {
        format!(
            "위키 페이지 디렉토리를 읽을 수 없습니다 (경로: {:?}): {}",
            wiki_pages_dir_path, e
        )
    })? {
        let entry = entry.map_err(|e| format!("디렉토리 항목 읽기 실패: {}", e))?;
        let path = entry.path();

        if path.is_file()
            && path
                .extension()
                .map_or(false, |ext| ext == WIKI_PAGE_FILE_EXTENSION)
        {
            let mut file_content = String::new();
            if fs::File::open(&path)
                .and_then(|mut f| f.read_to_string(&mut file_content))
                .is_err()
            {
                eprintln!(
                    "위키 페이지 요약 읽기 실패 (파일 열기/읽기 오류): {:?}",
                    path
                );
                continue;
            }

            match serde_json::from_str::<PartialWikiPageDataForSummary>(&file_content) {
                Ok(partial_data) => {
                    page_summaries.push(WikiPageSummaryData {
                        id: partial_data.id,
                        title: partial_data.title,
                        category: partial_data.category,
                        thumbnail: partial_data.thumbnail,
                        updated_at: partial_data.updated_at,
                    });
                }
                Err(e) => {
                    eprintln!(
                        "위키 페이지 요약 정보 JSON 파싱 실패 (파일: {:?}): {}. 건너<0xEB><0><0x88>니다.",
                        path, e
                    );
                }
            }
        }
    }
    // updatedAt 기준으로 최신순 정렬 (또는 title 등 다른 기준으로 정렬 가능)
    page_summaries.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(page_summaries)
}
