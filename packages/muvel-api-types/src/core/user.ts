export interface User {
  id: string
  username: string
  avatar: string
  recentEpisodeId: number
  admin: boolean
}

export type UserPublicDto = Pick<User, "username" | "avatar">

export const sampleUser: User = {
  id: "1",
  username: "testUser",
  avatar: "https://example.com/avatar.png",
  recentEpisodeId: 1,
  admin: false,
}
