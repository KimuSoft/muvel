import { frontApi } from "~/utils/frontApi"
import type {
  ExportNovelResponseDto,
  GetNovelResponseDto,
  Novel,
} from "muvel-api-types"

export const createNovel = async ({
  userId,
  ...dto
}: Pick<Novel, "title" | "share"> & { userId: string }): Promise<Novel> => {
  const { data } = await frontApi.post<Novel>(`/users/${userId}/novels`, dto)
  return data
}

export const getNovel = async (id: string): Promise<GetNovelResponseDto> => {
  const { data } = await frontApi.get<GetNovelResponseDto>(`/novels/${id}`)
  return data
}

export const updateNovel = async ({
  id,
  ...dto
}: Partial<Novel>): Promise<Novel> => {
  const { data } = await frontApi.patch<Novel>(`/novels/${id}`, dto)
  return data
}

export const exportNovel = async (
  id: string,
): Promise<ExportNovelResponseDto> => {
  const { data } = await frontApi.get<ExportNovelResponseDto>(
    `/novels/${id}/export`,
  )
  return data
}
