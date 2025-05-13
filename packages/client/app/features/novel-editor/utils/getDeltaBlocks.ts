import { isEqual, keyBy } from "lodash-es"
import type { Block, DeltaBlock } from "muvel-api-types"
import { DeltaBlockAction } from "muvel-api-types"

export const getDeltaBlock = (
  previous: Block[],
  current: Block[],
): DeltaBlock[] => {
  const prevMap = keyBy(previous, "id")
  const currMap = keyBy(current, "id")

  const previousBlockOriginalOrders = new Map<string, number>()
  previous.forEach((block, index) => {
    previousBlockOriginalOrders.set(block.id, index)
  })

  const deltas: DeltaBlock[] = []
  const now = new Date()

  for (let i = 0; i < current.length; i++) {
    const currentBlock = current[i]
    const prevBlock = prevMap[currentBlock.id]
    const newOrder = i

    // 새 블록 (기존 id가 없음) → 추가
    if (!prevBlock) {
      deltas.push({
        id: currentBlock.id,
        action: DeltaBlockAction.Create,
        date: now,
        content: currentBlock.content,
        blockType: currentBlock.blockType,
        attr: currentBlock.attr,
        order: newOrder,
      })
      continue
    }

    // 기존 블록 → 업데이트
    const changedFields: Partial<Omit<Block, "updatedAt" | "id" | "text">> = {}
    let hasChanged = false

    if (!isEqual(currentBlock.content, prevBlock.content)) {
      changedFields.content = currentBlock.content
      hasChanged = true
    }

    if (currentBlock.blockType !== prevBlock.blockType) {
      changedFields.blockType = currentBlock.blockType
      hasChanged = true
    }

    if (!isEqual(currentBlock.attr, prevBlock.attr)) {
      changedFields.attr = currentBlock.attr
      hasChanged = true
    }

    const originalOrder = previousBlockOriginalOrders.get(prevBlock.id)
    if (newOrder !== originalOrder) {
      changedFields.order = newOrder
      hasChanged = true
    }

    if (hasChanged) {
      deltas.push({
        id: currentBlock.id,
        action: DeltaBlockAction.Update,
        date: now,
        ...changedFields,
      })
    }
  }

  // 2. 삭제된 블록
  for (const prevBlock of previous) {
    if (!currMap[prevBlock.id]) {
      deltas.push({
        id: prevBlock.id,
        action: DeltaBlockAction.Delete,
        date: now,
      })
    }
  }

  return deltas
}
