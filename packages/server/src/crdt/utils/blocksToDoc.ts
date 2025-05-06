import { Block } from "muvel-api-types"
import { type Node as PMNode, Schema } from "prosemirror-model"

export function blocksToDoc(blocks: Block[], schema: Schema): PMNode {
  const children = blocks.map((block) => {
    const nodeType = schema.nodes[block.blockType]
    if (!nodeType) {
      throw new Error(`Unknown blockType: ${block.blockType}`)
    }

    const attrs = block.attr
      ? { ...block.attr, id: block.id }
      : { id: block.id }

    // ✅ content 보정 + 유효성 필터링
    const content = Array.isArray(block.content)
      ? (block.content
          .filter(
            (nodeJson): nodeJson is { type: string } =>
              nodeJson && typeof nodeJson === "object" && "type" in nodeJson,
          )
          .map((nodeJson) => {
            try {
              return schema.nodeFromJSON(nodeJson)
            } catch (err) {
              console.warn("❌ invalid nodeJson in block.content", {
                blockId: block.id,
                nodeJson,
                err,
              })
              return null
            }
          })
          .filter(Boolean) as any) // null 제거
      : []

    return nodeType.create(attrs, content)
  })

  return schema.nodes.doc.create(null, children)
}
