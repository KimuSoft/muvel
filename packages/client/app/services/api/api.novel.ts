import type {
  CreateEpisodeBodyDto,
  CreateNovelRequestDto,
  CreateWikiPageRequestBody,
  Episode,
  ExportNovelResponseDto,
  GetNovelResponseDto,
  Novel,
  UpdateNovelRequestDto,
  WikiPage,
} from "muvel-api-types"
import { api } from "~/utils/api"
import type { AxiosRequestConfig, AxiosResponse } from "axios"

export const createCloudNovel = async (
  dto: CreateNovelRequestDto & AxiosRequestConfig<any>,
): Promise<Novel> => {
  const { data } = await api.post<
    Novel,
    AxiosResponse<Novel>,
    CreateNovelRequestDto
  >(`novels`, dto)
  return data
}

export const getCloudNovel = async (
  id: string,
  config?: AxiosRequestConfig<any>,
): Promise<GetNovelResponseDto> => {
  const { data } = await api.get<GetNovelResponseDto>(`/novels/${id}`, config)
  return data
}

export const updateCloudNovel = async (
  id: string,
  dto: UpdateNovelRequestDto,
): Promise<Novel> => {
  const { data } = await api.patch<
    Novel,
    AxiosResponse<Novel>,
    UpdateNovelRequestDto
  >(`/novels/${id}`, dto)
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
  dto: CreateEpisodeBodyDto,
) => {
  const { data } = await api.post<
    Episode,
    AxiosResponse<Episode>,
    CreateEpisodeBodyDto
  >(`/novels/${novelId}/episodes`, dto)
  return data
}

export const createCloudNovelWikiPage = async (
  novelId: string,
  dto: CreateWikiPageRequestBody,
) => {
  const { data } = await api.post<
    WikiPage,
    AxiosResponse<WikiPage>,
    CreateWikiPageRequestBody
  >(`/novels/${novelId}/wiki-pages`, dto)
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
