use crate::models::search_results::SearchInNovelResponse;
use crate::repositories::search_repository::SearchRepository;
use tauri::{command, AppHandle};

const DEFAULT_SEARCH_LIMIT: usize = 20; // 기본 검색 결과 제한 수
const MAX_SEARCH_LIMIT: usize = 100; // 최대 검색 결과 제한 수

#[command]
pub fn search_in_novel_command(
    app_handle: AppHandle,
    novel_id: String,
    query: String,
    limit: Option<usize>,
    offset: Option<usize>,
) -> Result<SearchInNovelResponse, String> {
    if query.trim().is_empty() {
        return Ok(SearchInNovelResponse {
            hits: Vec::new(),
            query,
            processing_time_ms: 0,
            limit: limit.unwrap_or(DEFAULT_SEARCH_LIMIT).min(MAX_SEARCH_LIMIT),
            offset: offset.unwrap_or(0),
            estimated_total_hits: 0,
        });
    }

    let repo = SearchRepository::new(&app_handle);
    let start_time = std::time::Instant::now();

    // 리포지토리에서 모든 가능한 검색 결과를 가져옴
    let all_hits = repo.search_novel_content(&novel_id, &query)?;

    let estimated_total_hits = all_hits.len();
    let current_offset = offset.unwrap_or(0);
    // limit 값 보정 (기본값 및 최대값 적용)
    let current_limit = limit.unwrap_or(DEFAULT_SEARCH_LIMIT).min(MAX_SEARCH_LIMIT);

    // 페이지네이션 적용
    let paginated_hits = all_hits
        .into_iter()
        .skip(current_offset)
        .take(current_limit)
        .collect();

    let processing_time_ms = start_time.elapsed().as_millis() as u64;

    Ok(SearchInNovelResponse {
        hits: paginated_hits,
        query,
        processing_time_ms,
        limit: current_limit,
        offset: current_offset,
        estimated_total_hits,
    })
}
