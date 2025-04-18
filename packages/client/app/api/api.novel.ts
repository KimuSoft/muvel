import { frontApi } from "~/utils/frontApi"
import type { Novel } from "~/types/novel.type"
import type { Episode } from "~/types/episode.type"

export const createNovel = async ({
  userId,
  ...dto
}: Pick<Novel, "title" | "share"> & { userId: string }): Promise<Novel> => {
  const { data } = await frontApi.post<Novel>(`/users/${userId}/novels`, dto)
  return data
}

export const updateNovel = async ({
  id,
  ...dto
}: Partial<Novel>): Promise<Novel> => {
  const { data } = await frontApi.patch<Novel>(`/novels/${id}`, dto)
  return data
}

export type FullNovel = Omit<Novel, "episodes"> & { episodes: Episode[] }
export const exportNovel = async (id: string): Promise<FullNovel> => {
  const { data } = await frontApi.get<FullNovel>(`/novels/${id}/export`)
  return data
}
