import { BlockType, LegacyBlockType } from "../enums"
import { BlockAttrs, PMNodeJSON } from "../editor"

export interface Block {
  id: string
  text: string
  content: PMNodeJSON[]
  blockType: BlockType
  attr?: BlockAttrs
  order?: number
}

export interface LegacyBlock {
  id: string
  episodeId?: string
  content: string
  blockType: LegacyBlockType
  characterId?: string
}

export const sampleLegacyBlock: LegacyBlock = {
  id: "1",
  content: "테스트용 블록입니다.",
  blockType: LegacyBlockType.Describe,
}

export const sampleBlock: Block = {
  id: "1",
  text: "테스트용 블록입니다.",
  content: [],
  blockType: BlockType.Describe,
  order: 0,
}
