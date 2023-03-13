import { BlockType, PartialBlock } from "../types/block.type"
import { v4 } from "uuid"

const stringToBlock = (content: string): PartialBlock[] => {
  const blocks: PartialBlock[] = []
  const lines = content.split("\n")
  for (const line of lines) {
    if (!line.trim()) continue

    const blockType = /^["“”].*["“”]$/.test(line.trim())
      ? BlockType.DoubleQuote
      : BlockType.Describe

    blocks.push({
      blockType: blockType,
      content: line
        .trim()
        .replace(/^"(.*)"$/, "“$1”")
        .replace(/\.\.\./g, "…"),
      id: v4(),
    })
  }
  return blocks
}

export default stringToBlock
