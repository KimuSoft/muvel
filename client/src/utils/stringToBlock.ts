import { BlockType, PartialBlock } from "../types/block.type"
import { v4 } from "uuid"

const stringToBlock = (content: string): PartialBlock[] => {
  const blocks: PartialBlock[] = []
  const lines = content.split("\n")
  for (const line of lines) {
    const content = line.trim()

    if (!content) continue

    let blockType = BlockType.Describe
    if (/^["“”].*["“”]$/.test(content)) {
      blockType = BlockType.DoubleQuote
    } else if (/^[\s-=*]+$/.test(content)) {
      blockType = BlockType.Divider
    }

    blocks.push({
      blockType: blockType,
      content:
        blockType !== BlockType.Divider
          ? content.replace(/^"(.*)"$/, "“$1”").replace(/\.\.\./g, "…")
          : "",
      id: v4(),
    })
  }
  return blocks
}

export default stringToBlock
