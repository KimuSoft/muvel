import { api } from "~/utils/api"
import {
  SnapshotReason,
  type AiAnalysis,
  type Block,
  type CreateAiAnalysisRequestBody,
  type Episode,
  type EpisodeSnapshot,
  type GetEpisodeResponseDto,
} from "muvel-api-types"

export const getEpisodeBlocks = async (episodeId: string) => {
  const { data } = await api.get<Block[]>(`episodes/${episodeId}/blocks`)
  return data
}

export const getEpisodeById = async (episodeId: string) => {
  const { data } = await api.get<GetEpisodeResponseDto>(`episodes/${episodeId}`)
  return data
}

export const updateEpisode = async (
  episodeId: string,
  patch: Partial<Episode>,
) => {
  const { data } = await api.patch<Episode>(`episodes/${episodeId}`, patch)
  return data
}

export const updateEpisodeBlocks = async (
  episodeId: string,
  blocks: (
    | (Omit<Block, "text"> & { isDeleted?: boolean })
    | { id: string; isDeleted: boolean }
  )[],
) => {
  const { data } = await api.patch<Block[]>(
    `episodes/${episodeId}/blocks`,
    blocks,
  )
  return data
}

export const createAiAnalysis = async (
  episodeId: string,
  options: CreateAiAnalysisRequestBody,
) => {
  const { data } = await api.post<AiAnalysis[]>(
    `episodes/${episodeId}/analyses`,
    options,
  )
  return data
}

export const getAiAnalysis = async (episodeId: string) => {
  const { data } = await api.get<AiAnalysis[]>(`episodes/${episodeId}/analyses`)
  return data
}

export const getSnapshots = async (episodeId: string) => {
  const { data } = await api.get<EpisodeSnapshot[]>(
    `episodes/${episodeId}/snapshots`,
  )
  return data
}

export const saveSnapshot = async (
  episodeId: string,
  reason: SnapshotReason = SnapshotReason.Manual,
) => {
  const { data } = await api.post(`/episodes/${episodeId}/snapshots`, {
    reason,
  })
  return data
}
