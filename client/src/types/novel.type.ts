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
  title: "와 샌즈",
  description: "키뮤는 너무 귀엽다 꺄르륵",
  episodeIds: [],
  episodes: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  authorId: "",
  author: { id: "", avatar: "", username: "키뮤키뮤" },
  thumbnail: "",
  share: ShareType.Public,
}
