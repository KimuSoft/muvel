import { PartialData } from "./index"
import { Novel } from "./novel.type"
import { PartialEpisode } from "./episode.type"

export interface PartialUser extends PartialData {
  username: string
  avatar: string
}

export interface User extends PartialUser {
  novelIds: number[]
  recentEpisodeId: number
  admin: boolean
}
