import { api } from "~/utils/api"
import {
  type AiAnalysis,
  type AiAnalysisScore,
  type Block,
  type BlockChange,
  type CreateAiAnalysisRequestBody,
  type DeltaBlock,
  type Episode,
  type EpisodeSnapshot,
  type GetEpisodeBlocksResponse,
  type GetEpisodeResponseDto,
  SnapshotReason,
} from "muvel-api-types"

export const getCloudEpisodeBlocks = async (episodeId: string) => {
  const { data } = await api.get<GetEpisodeBlocksResponse>(
    `episodes/${episodeId}/blocks`,
  )
  return data
}

export const getCloudEpisodeById = async (episodeId: string) => {
  const { data } = await api.get<GetEpisodeResponseDto>(`episodes/${episodeId}`)
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
  patch: Partial<Episode>,
) => {
  const { data } = await api.patch<Episode>(`episodes/${episodeId}`, patch)
  return data
}

export const updateCloudEpisodeBlocks = async (
  episodeId: string,
  blockChanges: BlockChange[],
) => {
  const { data } = await api.patch<Block[]>(
    `episodes/${episodeId}/blocks`,
    blockChanges,
  )
  return data
}

// deltaBlocks를 양방향으로 적용함 (변경사항을 적용하고 서버에서 반영된 블록 전체를 받아옴)
export const syncCloudDeltaBlocks = async (
  episodeId: string,
  deltaBlocks: DeltaBlock[] = [],
) => {
  const { data } = await api.patch(`episodes/${episodeId}/blocks/sync`, {
    deltaBlocks: deltaBlocks,
  })
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

export const getCloudSnapshots = async (episodeId: string) => {
  const { data } = await api.get<EpisodeSnapshot[]>(
    `episodes/${episodeId}/snapshots`,
  )
  return data
}

export const saveCloudSnapshot = async (
  episodeId: string,
  reason: SnapshotReason = SnapshotReason.Manual,
) => {
  const { data } = await api.post(`/episodes/${episodeId}/snapshots`, {
    reason,
  })
  return data
}

export type getAvgAiAnalysisResponse = AiAnalysisScore &
  Pick<AiAnalysis, "overallRating">
export const getAvgAiAnalysis = async () => {
  const { data } = await api.get<getAvgAiAnalysisResponse>(
    `episodes/avg_analysis`,
  )
  return data
}
