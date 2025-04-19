import { type LegacyBlock, LegacyBlockType } from "muvel-api-types"
import { v4 } from "uuid"

const stringToBlock = (content: string): LegacyBlock[] => {
  const blocks: LegacyBlock[] = []
  const lines = content.split("\n")
  for (const line of lines) {
    const content = line.trim()

    if (!content) continue

    let blockType = LegacyBlockType.Describe
    if (/^["“”].*["“”]$/.test(content)) {
      blockType = LegacyBlockType.DoubleQuote
    } else if (/^[\s-=*]+$/.test(content)) {
      blockType = LegacyBlockType.Divider
    }

    blocks.push({
      blockType: blockType,
      content:
        blockType !== LegacyBlockType.Divider
          ? content.replace(/^"(.*)"$/, "“$1”").replace(/\.\.\./g, "…")
          : "",
      id: v4(),
    })
  }
  return blocks
}

export default stringToBlock
