export interface AiAnalysis {
  id: string
  overallRating: number
  scores: AiAnalysisScore
  comments: { nickname: string; content: string }[]
  createdAt: string
  updatedAt: string
}

export interface AiAnalysisScore {
  writingStyle: number // 문장력
  interest: number // 흥미도
  character: number // 캐릭터
  immersion: number // 몰입력
  anticipation: number // 기대감
}

export interface CreateAiAnalysisRequestBody {
  usePreviousSummary?: boolean
}
