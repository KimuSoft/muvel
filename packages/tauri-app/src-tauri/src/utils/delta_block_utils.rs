use crate::models::block::{Block, DeltaBlock, DeltaBlockAction};
use std::collections::HashMap;

/// ProseMirror의 content JSON 배열에서 순수 텍스트를 추출합니다.
fn calculate_block_text_from_content(content: &Vec<serde_json::Value>) -> String {
    content
        .iter()
        .filter_map(|node| {
            if let Some(obj) = node.as_object() {
                if obj.get("type").and_then(|t| t.as_str()) == Some("text") {
                    obj.get("text").and_then(|t| t.as_str()).map(str::to_string)
                } else {
                    None
                }
            } else {
                None
            }
        })
        .collect::<Vec<String>>()
        .join("")
}

/// 주어진 `DeltaBlock` 목록을 기존 `Block` 목록에 병합합니다.
///
/// # Arguments
/// * `current_blocks`: 현재 `Block` 객체의 벡터입니다. 이 벡터는 변경될 수 있습니다.
/// * `delta_blocks`: 적용할 `DeltaBlock` 객체의 벡터입니다.
/// * `server_update_time`: 변경 사항이 적용된 서버 시간 (ISO 8601 문자열)입니다.
///
/// # Returns
/// * `Result<Vec<Block>, String>`: 성공 시 병합된 `Block` 객체의 벡터, 실패 시 에러 메시지.
pub fn merge_delta_blocks(
    initial_blocks: Vec<Block>,
    delta_blocks: Vec<DeltaBlock>,
    // server_update_time: &str, // DeltaBlock의 date 필드를 사용하므로 이 파라미터는 불필요할 수 있습니다.
) -> Result<Vec<Block>, String> {
    let mut current_blocks_map: HashMap<String, Block> = initial_blocks
        .into_iter()
        .map(|b| (b.id.clone(), b))
        .collect();

    for delta in delta_blocks {
        match delta.action {
            DeltaBlockAction::Create => {
                let block_content = delta.content.ok_or_else(|| {
                    format!("생성 액션 시 블록 ID {}에 content가 없습니다.", delta.id)
                })?;

                let block_text = calculate_block_text_from_content(&block_content);

                // order는 f32로 받지만 Block에는 i32로 저장
                let new_block_f_order = delta.order.unwrap_or_else(|| {
                    current_blocks_map
                        .values()
                        .map(|b| b.order as f32) // i32를 f32로 변환하여 계산
                        .fold(0.0_f32, |max_ord, current_ord| if current_ord > max_ord { current_ord } else { max_ord }) // 수정: f32::max 대신 직접 비교
                        + 1.0
                });

                let new_block = Block {
                    id: delta.id.clone(),
                    text: block_text,
                    content: block_content,
                    block_type: delta.block_type.ok_or_else(|| {
                        format!("생성 액션 시 블록 ID {}에 blockType이 없습니다.", delta.id)
                    })?,
                    attr: delta.attr,
                    order: new_block_f_order.round() as i32,
                    updated_at: Some(delta.date.clone()), // Delta의 date를 사용
                };
                current_blocks_map.insert(delta.id, new_block);
            }
            DeltaBlockAction::Update => {
                if let Some(block_to_update) = current_blocks_map.get_mut(&delta.id) {
                    let mut changed = false;
                    if let Some(content_val) = delta.content {
                        block_to_update.content = content_val;
                        block_to_update.text =
                            calculate_block_text_from_content(&block_to_update.content);
                        changed = true;
                    }
                    if let Some(block_type_val) = delta.block_type {
                        block_to_update.block_type = block_type_val;
                        changed = true;
                    }
                    if delta.attr.is_some() {
                        // null도 유효한 업데이트로 간주
                        block_to_update.attr = delta.attr;
                        changed = true;
                    }
                    if let Some(f_order_val) = delta.order {
                        block_to_update.order = f_order_val.round() as i32;
                        changed = true;
                    }

                    if changed {
                        block_to_update.updated_at = Some(delta.date); // Delta의 date를 사용
                    }
                } else {
                    // 업데이트하려는 블록이 없는 경우, 생성으로 처리할 수도 있으나 여기서는 경고만 출력
                    eprintln!(
                        "Warning: 업데이트하려는 블록 ID {}를 찾을 수 없습니다. Delta: {:?}",
                        delta.id, delta
                    );
                    // 또는 여기서 에러를 반환할 수도 있습니다.
                    // return Err(format!("업데이트하려는 블록 ID {}를 찾을 수 없습니다.", delta.id));
                }
            }
            DeltaBlockAction::Delete => {
                current_blocks_map.remove(&delta.id);
            }
        }
    }

    let mut updated_blocks_vec: Vec<Block> = current_blocks_map.into_values().collect();
    updated_blocks_vec.sort_by(|a, b| a.order.cmp(&b.order));

    Ok(updated_blocks_vec)
}
