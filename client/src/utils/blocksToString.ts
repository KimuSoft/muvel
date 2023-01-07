
import {IBlock} from "../types";

const blocksToString = (blocks: IBlock[]): string => {
  let content = ""

  let index = 0
  for (const block of blocks) {
    if (index && blocks[index - 1].blockType !== block.blockType)
      content += "\n"

    content += block.content + "\n"

    index++
  }
  return content
}

export default blocksToString
