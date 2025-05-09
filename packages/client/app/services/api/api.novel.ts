import type {
  Episode,
  EpisodeType,
  ExportNovelResponseDto,
  GetNovelResponseDto,
  Novel,
} from "muvel-api-types"
import { api } from "~/utils/api"

export const createCloudNovel = async (
  dto: Pick<Novel, "title" | "share">,
): Promise<Novel> => {
  const { data } = await api.post<Novel>(`novels`, dto)
  return data
}

export const getCloudNovel = async (
  id: string,
): Promise<GetNovelResponseDto> => {
  const { data } = await api.get<GetNovelResponseDto>(`/novels/${id}`)
  return data
}

export const updateCloudNovel = async ({
  id,
  ...dto
}: Partial<Novel>): Promise<Novel> => {
  const { data } = await api.patch<Novel>(`/novels/${id}`, dto)
  return data
}

export const exportCloudNovel = async (
  id: string,
): Promise<ExportNovelResponseDto> => {
  const { data } = await api.get<ExportNovelResponseDto>(`/novels/${id}/export`)
  return data
}

export const createCloudNovelEpisode = async (
  novelId: string,
  dto: {
    title?: string
    description?: string
    episodeType?: EpisodeType
  } = {},
) => {
  const { data } = await api.post<Episode>(`/novels/${novelId}/episodes`, dto)
  return data
}

export const updateCloudNovelEpisodes = async (
  novelId: string,
  episodeDiffs: ({ id: string } & Partial<Episode>)[],
) => {
  const { data } = await api.patch<Episode[]>(
    `/novels/${novelId}/episodes`,
    episodeDiffs,
  )
  return data
}

export const deleteCloudNovel = async (id: string) => {
  const { data } = await api.delete<Novel>(`/novels/${id}`)
  return data
}
