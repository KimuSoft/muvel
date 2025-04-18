import type { PartialData } from "./index"

export interface PartialUser extends PartialData {
  username: string
  avatar: string
}

export interface User extends PartialUser {
  novelIds: number[]
  recentEpisodeId: number
  admin: boolean
}
