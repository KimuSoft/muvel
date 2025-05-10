import type { Novel, User } from "muvel-api-types"
import { api } from "~/utils/api"
import { isAxiosError, type AxiosRequestConfig } from "axios"

export const getMe = async (config?: AxiosRequestConfig<any>) => {
  try {
    const { data } = await api.get<User>("/users/me", config)
    return data
  } catch (e) {
    if (!isAxiosError(e)) throw e
    if (e.response?.status === 401) return null
    console.error("Error fetching user data:", e)
    throw e
  }
}

export const getUserCount = async () => {
  console.log("BASE_URL", api.defaults.baseURL)
  const { data } = await api.get<number>("/users/count")
  return data
}

export const getMyRecentNovels = async (config?: AxiosRequestConfig<any>) => {
  const { data } = await api.get<Novel[]>("/users/recent-novels", config)
  return data
}

export const getUserCloudNovels = async (
  userId: string,
  config?: AxiosRequestConfig<any>,
) => {
  const { data } = await api.get<Novel[]>(`/users/${userId}/novels`, config)
  return data
}
