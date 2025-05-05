import type { User } from "muvel-api-types"
import { api } from "~/utils/api"
import { isAxiosError } from "axios"

export const getMe = async () => {
  try {
    const { data } = await api.get<User>("/users/me")
    return data
  } catch (e) {
    if (!isAxiosError(e)) throw e
    if (e.response?.status === 401) return null
    console.error("Error fetching user data:", e)
    throw e
  }
}
