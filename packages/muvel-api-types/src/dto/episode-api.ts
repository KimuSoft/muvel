import { BasePermission, Episode, Novel, PartialEpisodeBlock } from "../core"

export type GetEpisodeResponseDto = Episode & {
  permissions: BasePermission
  novel: Novel
}

export type CreateEpisodeBodyDto = Partial<
  Pick<Episode, "title" | "episodeType">
>

export type UpdateEpisodeBodyDto = Partial<
  Omit<
    Episode,
    "id" | "novelId" | "contentLength" | "createdAt" | "updatedAt" | "aiRating"
  >
>

export type GetEpisodeBlocksResponse = PartialEpisodeBlock[]
