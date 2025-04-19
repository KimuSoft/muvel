import { ShareType } from "../enums"
import { sampleUser, UserPublicDto } from "./user"

export interface Novel {
  id: string
  title: string
  description: string
  author: UserPublicDto
  thumbnail: string
  episodeCount: number
  createdAt: Date
  updatedAt: Date
  share: ShareType
  tags: string[]
}

export const initialNovel: Novel = {
  id: "",
  title: "",
  description: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  episodeCount: 0,
  author: sampleUser,
  thumbnail: "",
  share: ShareType.Public,
  tags: [],
}
