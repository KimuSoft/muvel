import { BasePermission, Block, Episode, Novel, WikiPage } from "../core"

export type GetNovelResponseDto = Novel & {
  permissions: BasePermission
  episodes: Episode[]
  wikiPages: WikiPage[]
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
