export interface User {
  id: string
  username: string
  avatar: string
  admin: boolean
  point: number
  googleDriveId?: number
  createdAt: string
  updatedAt: string
}

export type UserPublicDto = Pick<User, "id" | "username" | "avatar">

export const sampleUser: User = {
  id: "1",
  username: "testUser",
  avatar: "https://example.com/avatar.png",
  admin: false,
  point: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
