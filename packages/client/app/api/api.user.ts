import type { User } from "muvel-api-types"
import { api } from "~/utils/api"

export const getMe = async () => {
  const { data } = await api.get<User>("/users/me")
  return data
}
