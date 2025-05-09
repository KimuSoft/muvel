import { BlockType, LegacyBlockType } from "../enums"
import { BlockAttrs, PMNodeJSON } from "../editor"

export interface Block {
  id: string
  text: string
  content: PMNodeJSON[]
  blockType: BlockType
  attr: BlockAttrs | null
  order: number
  updatedAt?: string
}

export const sampleBlock: Block = {
  id: "1",
  text: "테스트용 블록입니다.",
  content: [],
  attr: null,
  blockType: BlockType.Describe,
  order: 0,
}
