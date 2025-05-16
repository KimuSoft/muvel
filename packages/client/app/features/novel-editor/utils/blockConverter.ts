import { type Block, BlockType, type PMNodeJSON } from "muvel-api-types"
import { type Node as PMNode, Schema } from "prosemirror-model"

// ✅ ProseMirror document를 생성하는 함수
export function blocksToDoc(blocks: Block[], schema: Schema): PMNode {
  const children = blocks.map((block) => {
    const nodeType = schema.nodes[block.blockType]
    if (!nodeType) {
      throw new Error(`Unknown blockType: ${block.blockType}`)
    }

    try {
      return nodeType.create(
        block.attr ? { ...block.attr, id: block.id } : { id: block.id },
        block.content.map((nodeJson) => schema.nodeFromJSON(nodeJson)),
      )
    } catch (e) {
      console.log(block)
      console.error(e)
      console.warn("Convert blank to fill")
      return schema.nodes[BlockType.Describe].createAndFill()!
    }
  })

  return schema.nodes.doc.create(null, children)
}

// ✅ ProseMirror document → Block[] 변환
export function docToBlocks(doc: PMNode): Block[] {
  return doc.content.content.map((node, idx) => {
    const blockType = node.type.name as BlockType
    const attr = node.attrs ?? {}
    const content = node.content?.content.map((child) =>
      child.toJSON(),
    ) as PMNodeJSON[]

    if (!attr.id) console.warn(`Block ${blockType} has no id.`, node)

    const { id, ...restAttr } = attr

    if (!id) console.warn(`Block ${blockType} has no id.`, node)
    return {
      id: id || crypto.randomUUID(),
      text: node.textContent,
      content,
      blockType,
      attr: restAttr,
      order: idx,
    }
  })
}
