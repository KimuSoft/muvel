import { Block, BlockType } from "../types/block.type"

const blocksToText = (blocks: Block[], option?: ConvertOption): string => {
  if (!option?.exportComment) {
    blocks = blocks.filter((block) => block.blockType !== BlockType.Comment)
  }

  let content = ""

  let index = 0
  for (const block of blocks) {
    if (block.blockType === BlockType.Divider)
      content += option?.divider ?? "------------------\n"

    if (index && blocks[index - 1].blockType !== block.blockType)
      content += "\n".repeat(option?.typeSpacing ?? 1)

    content += block.content + "\n".repeat(option?.spacing ?? 2)

    index++
  }

  if (option?.replacePunctuation) {
    // ... to … , -- to —, - to –
    content = content
      .replace(/\.\.\./g, "…")
      .replace(/--/g, "—")
      .replace(/-/g, "–")
  }

  return content
}

interface ConvertOption {
  indent?: number
  spacing?: number
  typeSpacing?: number
  exportComment?: boolean
  replacePunctuation?: boolean
  divider?: string
}

export default blocksToText
