import { api } from "~/utils/api"
import {
  type DeltaBlock,
  type Episode,
  type GetEpisodeBlocksResponse,
  type GetEpisodeResponseDto,
  type UpdateEpisodeBodyDto,
} from "muvel-api-types"

export const getCloudEpisodeById = async (episodeId: string) => {
  const { data } = await api.get<GetEpisodeResponseDto>(`episodes/${episodeId}`)
  return data
}

export const getCloudEpisodeBlocks = async (episodeId: string) => {
  const { data } = await api.get<GetEpisodeBlocksResponse>(
    `episodes/${episodeId}/blocks`,
  )
  return data
}

export const deleteCloudEpisode = async (episodeId: string) => {
  const { data } = await api.delete<GetEpisodeResponseDto>(
    `episodes/${episodeId}`,
  )
  return data
}

export const updateCloudEpisode = async (
  episodeId: string,
  patch: Partial<UpdateEpisodeBodyDto>,
) => {
  const { data } = await api.patch<Episode>(`episodes/${episodeId}`, patch)
  return data
}

export const syncCloudDeltaBlocks = async (
  episodeId: string,
  deltaBlocks: DeltaBlock[] = [],
) => {
  const { data } = await api.patch(`episodes/${episodeId}/blocks/sync`, {
    deltaBlocks: deltaBlocks,
  })
  return data
}
