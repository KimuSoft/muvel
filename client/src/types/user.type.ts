import { PartialData } from "./index"
import { PartialNovel } from "./novel.type"

export interface PartialUser extends PartialData {
  username: string
  avatar: string
  recentEpisodeId: number
}

export interface User extends PartialUser {
  novels: PartialNovel[]
}
