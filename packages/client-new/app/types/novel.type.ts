import type { PartialData } from "./index"
import type { PartialEpisode } from "./episode.type"
import type { PartialUser } from "./user.type"

export interface PartialNovel extends PartialData {
  title: string
  description: string
  episodeIds: string[]
  authorId: string
  thumbnail: string
  createdAt: Date
  updatedAt: Date
  share: ShareType

  // 아직 서버에 반영되지 않은 사항
  tags: string[]
}

export interface NovelPermissions {
  read: boolean
  edit: boolean
  delete: boolean
}

export interface Novel extends PartialNovel {
  author: PartialUser
  episodes: PartialEpisode[]
}

export enum ShareType {
  Private,
  Unlisted,
  Public,
}

export const initialNovel: Novel = {
  id: "",
  title: "",
  description: "",
  episodeIds: [],
  episodes: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  authorId: "",
  author: { id: "", avatar: "", username: "" },
  thumbnail: "",
  share: ShareType.Public,
  tags: [],
}
