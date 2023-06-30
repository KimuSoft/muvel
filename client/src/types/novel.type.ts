import { PartialData } from "./index"
import { PartialEpisode } from "./episode.type"
import { PartialUser } from "./user.type"

export interface PartialNovel extends PartialData {
  title: string
  description: string
  episodeIds: string[]
  authorId: string
  thumbnail: string
  createdAt: Date
  updatedAt: Date
  share: ShareType
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
}
