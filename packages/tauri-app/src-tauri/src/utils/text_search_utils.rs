/// 대상 텍스트에 검색어가 포함되어 있는지 확인합니다 (대소문자 및 공백 무시).
///
/// # Arguments
/// * `text`: 검색 대상이 되는 전체 텍스트입니다.
/// * `query`: 찾고자 하는 검색어입니다.
///
/// # Returns
/// 검색어가 포함되어 있으면 `true`, 그렇지 않으면 `false`를 반환합니다.
pub fn contains_ignore_case_whitespace(text: &str, query: &str) -> bool {
    if query.is_empty() {
        return true; // 빈 검색어는 항상 참으로 간주 (또는 false로 할 수도 있음)
    }
    if text.is_empty() {
        return false;
    }

    // 1. 모든 공백 제거
    // 2. 소문자로 변환
    let processed_text: String = text
        .chars()
        .filter(|c| !c.is_whitespace())
        .collect::<String>()
        .to_lowercase();
    let processed_query: String = query
        .chars()
        .filter(|c| !c.is_whitespace())
        .collect::<String>()
        .to_lowercase();

    if processed_query.is_empty() && !query.is_empty() {
        // 쿼리가 공백으로만 이루어진 경우
        return false; // 또는 true로 처리할 수도 있음 (정책에 따라)
    }

    processed_text.contains(&processed_query)
}

/// 검색어가 포함된 텍스트의 일부(snippet)를 생성합니다.
///
/// # Arguments
/// * `text`: 전체 텍스트입니다.
/// * `query`: 검색어입니다.
/// * `max_len`: 스니펫의 최대 길이입니다.
/// * `context_len`: 검색어 앞뒤로 보여줄 문맥의 길이입니다.
///
/// # Returns
/// 생성된 스니펫 문자열입니다.
pub fn create_snippet(text: &str, query: &str, max_len: usize, context_len: usize) -> String {
    if query.is_empty() || text.is_empty() {
        return text.chars().take(max_len).collect();
    }

    let text_lower = text.to_lowercase();
    let query_lower = query.to_lowercase();

    if let Some(found_pos) = text_lower.find(&query_lower) {
        let query_actual_len = query.chars().count(); // 원본 쿼리의 실제 문자 길이

        // 원본 텍스트에서 실제 시작 위치 찾기 (소문자 변환으로 인한 길이 변화 고려)
        let mut original_start_byte_offset = 0;
        let mut char_count_before_found = 0;
        for (byte_offset, char_val) in text.char_indices() {
            if char_count_before_found == found_pos {
                // 여기서 found_pos는 text_lower 기준의 문자 인덱스
                original_start_byte_offset = byte_offset;
                break;
            }
            if text_lower.chars().nth(char_count_before_found)
                == Some(char_val.to_lowercase().next().unwrap_or_default())
            {
                char_count_before_found += 1;
            } else {
                // 로직이 복잡해질 수 있으므로, 여기서는 근사치로 처리하거나,
                // 정확한 매칭을 위해선 원본 텍스트와 소문자 텍스트 간의 인덱스 매핑이 필요.
                // 간단하게는 found_pos를 바이트 오프셋으로 가정하고 진행 (정확도 낮을 수 있음)
                original_start_byte_offset = found_pos; // 임시, 정확도 개선 필요
                break;
            }
        }

        // 원본 텍스트에서 실제 끝 위치 찾기
        let mut original_end_byte_offset = original_start_byte_offset;
        let mut current_query_match_len = 0;
        for (byte_offset, _char_val) in text[original_start_byte_offset..].char_indices() {
            original_end_byte_offset = original_start_byte_offset + byte_offset;
            if current_query_match_len >= query_actual_len {
                break;
            }
            current_query_match_len += 1;
        }
        if current_query_match_len < query_actual_len {
            // 끝까지 갔는데 쿼리 길이만큼 못채우면
            original_end_byte_offset = text.len();
        }

        let snippet_start_byte = original_start_byte_offset.saturating_sub(context_len * 3); // UTF-8 문자 고려하여 넉넉하게
        let snippet_end_byte = (original_end_byte_offset + context_len * 3).min(text.len());

        // 바이트 인덱스를 유효한 문자 경계로 조정
        let mut final_start_byte = snippet_start_byte;
        while final_start_byte > 0 && !text.is_char_boundary(final_start_byte) {
            final_start_byte -= 1;
        }
        let mut final_end_byte = snippet_end_byte;
        while final_end_byte < text.len() && !text.is_char_boundary(final_end_byte) {
            final_end_byte += 1;
        }
        // 최종 길이가 max_len을 넘지 않도록 조정 (가운데 정렬 시도)
        // 이 부분은 더 정교한 로직이 필요할 수 있음. 현재는 단순 자르기.
        let mut result_snippet = String::new();
        if final_start_byte > 0 {
            result_snippet.push_str("...");
        }
        result_snippet.push_str(text.get(final_start_byte..final_end_byte).unwrap_or(""));
        if final_end_byte < text.len() {
            result_snippet.push_str("...");
        }

        // 최종적으로 max_len에 맞게 자르기 (가운데 정렬은 복잡하므로 일단 앞부분)
        if result_snippet.chars().count() > max_len {
            result_snippet = result_snippet.chars().take(max_len - 3).collect::<String>() + "...";
        }
        result_snippet
    } else {
        // 검색어가 없으면 텍스트 앞부분을 스니펫으로 사용
        text.chars().take(max_len).collect()
    }
}
