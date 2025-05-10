// app/services/tauri/types.ts

import type {
  BasePermission,
  Block as ApiBlock,
  Block,
  CreateNovelRequestDto,
  Episode as ApiEpisode,
  Episode,
  GetEpisodeResponseDto,
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

export interface LocalEpisodeData extends Episode {}

export interface GetLocalNovelDetailsResponse extends LocalNovelData {
  permissions: BasePermission
}

export interface CreateLocalNovelOptions extends CreateNovelRequestDto {
  targetDirectoryPath: string
}

export type UpdateLocalEpisodeBlocksData = ApiBlock[]

export interface GetLocalEpisodeResponse extends GetEpisodeResponseDto {
  blocks: Block[]
}
