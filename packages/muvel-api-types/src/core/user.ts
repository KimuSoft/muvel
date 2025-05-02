export interface User {
  id: string
  username: string
  avatar: string
  recentEpisodeIds: string[]
  admin: boolean
  point: number
  // createdAt: number
  // updatedAt: number
}

export type UserPublicDto = Pick<User, "id" | "username" | "avatar">

export const sampleUser: User = {
  id: "1",
  username: "testUser",
  avatar: "https://example.com/avatar.png",
  recentEpisodeIds: [],
  admin: false,
  point: 0,
}
