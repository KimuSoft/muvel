import { ShareType } from "../enums"
import { sampleUser, UserPublicDto } from "./user"

export interface Novel {
  id: string
  title: string
  description: string
  author: UserPublicDto
  thumbnail: string
  episodeCount: number
  share: ShareType
  tags: string[]
  createdAt: string
  updatedAt: string
}

export const initialNovel: Novel = {
  id: "",
  title: "",
  description: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  episodeCount: 0,
  author: sampleUser,
  thumbnail: "",
  share: ShareType.Public,
  tags: [],
}
