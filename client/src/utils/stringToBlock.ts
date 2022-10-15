import { Block, BlockType } from "../types"

const stringToBlock = (content: string): Block[] => {
  const blocks: Block[] = []
  const lines = content.split("\n")
  for (const line of lines) {
    if (!line) continue

    const blockType = /^["“”].*["“”]/.test(line.trim())
      ? BlockType.Script
      : BlockType.Description

    blocks.push({
      blockType: blockType,
      content: line
        .trim()
        .replace(/^["“”](.*)["“”]$/, "$1")
        .replace(/\.\.\./g, "…"),
      id: Math.random().toString(),
    })
  }
  return blocks
}

export default stringToBlock
