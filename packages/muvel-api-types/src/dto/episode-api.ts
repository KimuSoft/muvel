import { BasePermission, Block, Episode, Novel } from "../core"

export type GetEpisodeResponseDto = Episode & {
  permissions: BasePermission
  novel: Novel
}

export type CreateEpisodeBodyDto = Partial<
  Pick<Episode, "title" | "episodeType">
>

export type UpdateEpisodeBodyDto = Partial<
  Omit<Episode, "id" | "novelId" | "contentLength" | "createdAt" | "updatedAt">
>

// 블록 변경 타입 (deprecated 예정, 아래 DeltaBlock 사용)
export type BlockChange =
  | (Omit<Block, "text" | "updatedAt"> & { isDeleted?: boolean })
  | { id: string; isDeleted: boolean }

export enum DeltaBlockAction {
  Create = "create",
  Update = "update",
  Delete = "delete",
}

export type DeltaBlock = Pick<Block, "id"> &
  Partial<Omit<Block, "updatedAt" | "id">> & {
    action: DeltaBlockAction
    date: Date | string
  }
