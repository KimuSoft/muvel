import type { Novel, User } from "muvel-api-types"
import { api } from "~/utils/api"
import { isAxiosError, type AxiosRequestConfig } from "axios"

export const getMe = async (config?: AxiosRequestConfig<any>) => {
  // 저장된 토큰이 없고 config(쿠키 등 인증정보)가 없으면 애초에 요청할 필요가 없으니 null 반환
  if (!localStorage.getItem("auth_token") && !config) return null

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
