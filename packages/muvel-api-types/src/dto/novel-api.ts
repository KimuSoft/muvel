import { BasePermission, Block, Episode, Novel } from "../core"

export type GetNovelResponseDto = Novel & {
  permissions: BasePermission
  episodes: Episode[]
}

export type CreateNovelRequestDto = Partial<Pick<Novel, "title" | "share">>

export type UpdateNovelRequestDto = Partial<
  Pick<
    Novel,
    "title" | "description" | "tags" | "thumbnail" | "episodeCount" | "share"
  >
>

export type ExportNovelResponseDto = Novel & {
  episodes: (Episode & { blocks: Block[] })[]
}
