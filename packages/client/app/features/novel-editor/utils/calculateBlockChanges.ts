import { isEqual, keyBy } from "lodash-es"
import type { Block, BlockChange } from "muvel-api-types"

export const getBlocksChange = (
  previous: Block[],
  current: Block[],
): BlockChange[] => {
  const prevMap = keyBy(previous, "id")
  const currMap = keyBy(current, "id")

  const changes: BlockChange[] = []

  // 1. 변경된 블록 감지
  for (let i = 0; i < current.length; i++) {
    const block = current[i]
    const original = prevMap[block.id]

    const blockWithOrder = { ...block, order: i } // ✅ 동적으로 order 부여

    // 새 블록 (id가 없음) → 추가
    if (!original) {
      changes.push(blockWithOrder)
      continue
    }

    const hasChanged =
      block.text !== original.text ||
      block.blockType !== original.blockType ||
      i !== previous.findIndex((b) => b.id === block.id) || // ✅ order 변경 감지
      !isEqual(block.content, original.content) ||
      !isEqual(block.attr ?? {}, original.attr ?? {})

    if (hasChanged) {
      changes.push(blockWithOrder)
    }
  }

  // 2. 삭제된 블록
  for (const prevBlock of previous) {
    if (!currMap[prevBlock.id]) {
      changes.push({ id: prevBlock.id, isDeleted: true })
    }
  }

  return changes
}
