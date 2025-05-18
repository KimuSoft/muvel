import { BaseBlock } from "../core"
import { EpisodeBlockType, MuvelBlockType, WikiBlockType } from "../enums"

export enum DeltaBlockAction {
  Create = "create",
  Update = "update",
  Delete = "delete",
}

export type DeltaBlock<BType = MuvelBlockType> = Pick<BaseBlock<BType>, "id"> &
  Partial<Omit<BaseBlock<BType>, "updatedAt" | "id" | "text">> & {
    action: DeltaBlockAction
    date: Date | string
  }

export type DeltaEpisodeBlock = DeltaBlock<EpisodeBlockType>
export type DeltaWikiBlock = DeltaBlock<WikiBlockType>
