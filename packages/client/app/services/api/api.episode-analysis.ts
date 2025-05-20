import type {
  AiAnalysis,
  AiAnalysisScore,
  CreateAiAnalysisRequestBody,
} from "muvel-api-types"
import { api } from "~/utils/api"

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

export type getAvgAiAnalysisResponse = AiAnalysisScore &
  Pick<AiAnalysis, "overallRating">

export const getAvgAiAnalysis = async () => {
  const { data } = await api.get<getAvgAiAnalysisResponse>(
    `episodes/avg_analysis`,
  )
  return data
}
