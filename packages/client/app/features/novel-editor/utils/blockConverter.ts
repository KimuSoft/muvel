import { type Block, BlockType, type PMNodeJSON } from "muvel-api-types"
import { Schema, type Node as PMNode } from "prosemirror-model"
import * as Y from "yjs"

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

// ✅ ProseMirror document → Block[] 변환
export function docToBlocks(doc: PMNode, episodeId: string): Block[] {
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

export function blocksToYXmlElements(
  blocks: Block[],
  schema: Schema,
): (Y.XmlElement | Y.XmlText)[] {
  const elements: (Y.XmlElement | Y.XmlText)[] = []

  blocks.forEach((block) => {
    const nodeType = schema.nodes[block.blockType]
    if (!nodeType) {
      console.warn(`Unknown node type: ${block.blockType}`)
      return
    }

    const yElem = new Y.XmlElement(block.blockType)
    const attrs = block.attr
      ? { ...block.attr, id: block.id }
      : { id: block.id }
    Object.entries(attrs).forEach(([k, v]) => {
      if (v != null) yElem.setAttribute(k, String(v))
    })

    if (Array.isArray(block.content)) {
      block.content.forEach((nodeJson) => {
        try {
          const pmNode = schema.nodeFromJSON(nodeJson)

          if (pmNode.isText) {
            const yText = new Y.XmlText()
            yText.insert(0, pmNode.text || "")
            yElem.push([yText])
          } else {
            const child = new Y.XmlElement(pmNode.type.name)
            Object.entries(pmNode.attrs ?? {}).forEach(([k, v]) =>
              child.setAttribute(k, String(v)),
            )
            if (pmNode.text) {
              const t = new Y.XmlText()
              t.insert(0, pmNode.text)
              child.push([t])
            }
            yElem.push([child])
          }
        } catch (e) {
          console.warn("Invalid nodeJson", nodeJson, e)
        }
      })
    }

    elements.push(yElem)
  })

  return elements
}
