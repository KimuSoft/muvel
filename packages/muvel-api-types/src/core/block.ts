import { EpisodeBlockType, MuvelBlockType, WikiBlockType } from "../enums"
import { BlockAttrs, PMNodeJSON } from "../editor"

export interface BaseBlock<BType = MuvelBlockType> {
  id: string
  text: string
  content: PMNodeJSON[]
  blockType: BType
  attr: BlockAttrs | null
  order: number
  updatedAt?: string
}

export type EpisodeBlock = BaseBlock<EpisodeBlockType>
export type WikiBlock = BaseBlock<WikiBlockType>

// @deprecated 명확성 때문에 EpisodeBlock 사용을 권장함
export type Block = EpisodeBlock
