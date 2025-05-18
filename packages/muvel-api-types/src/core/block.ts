import { BlockType, WikiBlockType } from "../enums"
import { BlockAttrs, PMNodeJSON } from "../editor"

export interface BaseBlock<BType extends string> {
  id: string
  text: string
  content: PMNodeJSON[]
  blockType: BType
  attr: BlockAttrs | null
  order: number
  updatedAt?: string
}

// 명확성 때문에 EpisodeBlock 사용을 권장함
export type Block = BaseBlock<BlockType>

export type EpisodeBlock = Block
export type WikiBlock = BaseBlock<WikiBlockType>
