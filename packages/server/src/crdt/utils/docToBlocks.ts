// ✅ ProseMirror document → Block[] 변환
import { Block, BlockType } from "muvel-api-types"
import type { Node as PMNode } from "prosemirror-model"

export function docToBlocks(doc: PMNode): Block[] {
  return (
    doc.content?.content?.map((node, idx) => {
      const blockType = node.type.name as BlockType
      const attr = node.attrs ?? {}

      // ✅ content 보정: 없으면 빈 배열 반환
      const content = Array.isArray(node.content?.content)
        ? node.content.content.map((child) => child.toJSON())
        : []

      if (!attr.id) console.warn(`Block ${blockType} has no id.`, node)

      const { id, ...restAttr } = attr

      return {
        id: id || crypto.randomUUID(),
        text: node.textContent,
        content,
        blockType,
        attr: restAttr,
        order: idx,
      }
    }) ?? []
  )
}
