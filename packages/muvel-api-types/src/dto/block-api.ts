import { Block } from "../core"

export enum DeltaBlockAction {
  Create = "create",
  Update = "update",
  Delete = "delete",
}

export type DeltaBlock = Pick<Block, "id"> &
  Partial<Omit<Block, "updatedAt" | "id" | "text">> & {
    action: DeltaBlockAction
    date: Date | string
  }
