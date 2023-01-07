import {BlockType, IBlock} from "../types";


const stringToBlock = (content: string): IBlock[] => {
  const blocks: IBlock[] = []
  const lines = content.split("\n")
  for (const line of lines) {
    if (!line) continue

    const blockType = /^["“”].*["“”]/.test(line.trim())
      ? BlockType.DoubleQuote
      : BlockType.Describe

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
