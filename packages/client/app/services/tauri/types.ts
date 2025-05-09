// app/services/tauri/types.ts

import type {
  BasePermission,
  Block as ApiBlock,
  Episode as ApiEpisode,
  Novel as ApiNovel,
  ShareType as ApiShareType,
} from "muvel-api-types"

export interface LocalNovelIndexEntry {
  id: string
  title: string
  episodeCount?: number
  thumbnail?: string
  lastOpened?: string
  path?: string
}

export interface LocalNovelData
  extends Omit<ApiNovel, "share" | "author" | "episodes"> {
  share: ApiShareType.Local
  author: null
  episodes: ApiEpisode[]
  localPath?: string
}

export interface GetLocalNovelDetailsResponse extends LocalNovelData {
  permissions: BasePermission
}

export interface LocalEpisodeData extends Omit<ApiEpisode, "novel"> {
  blocks: ApiBlock[]
}

export interface CreateLocalNovelOptions extends Pick<ApiNovel, "title"> {
  targetDirectoryPath: string
}

export type UpdateLocalNovelData = Partial<
  Pick<ApiNovel, "title" | "description" | "tags" | "thumbnail" | "share">
>

export interface CreateLocalEpisodeOptions
  extends Partial<Pick<ApiEpisode, "title" | "episodeType" | "order">> {
  novelId: string
}

export type UpdateLocalEpisodeMetadata = Partial<
  Pick<
    ApiEpisode,
    "title" | "description" | "authorComment" | "episodeType" | "order"
  >
>

export type UpdateLocalEpisodeBlocksData = ApiBlock[]
