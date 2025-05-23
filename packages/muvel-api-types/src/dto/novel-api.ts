import {
  BasePermission,
  Episode,
  EpisodeBlock,
  LocalNovel,
  Novel,
  WikiPage,
} from "../core"

export type NovelEpisodeContext = Omit<Episode, "flowDoc" | "authorComment">

export type GetNovelResponseDto = Novel & {
  permissions: BasePermission
  episodes: NovelEpisodeContext[]
  wikiPages: WikiPage[]
}

export type GetLocalNovelResponseDto = LocalNovel & {
  permissions: BasePermission
  episodes: NovelEpisodeContext[]
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
  episodes: (Episode & { blocks: EpisodeBlock[] })[]
}
