export interface AiAnalysis {
  id: string
  overallRating: number
  scores: {
    writingStyle: number // 문장력
    interest: number // 흥미도
    character: number // 캐릭터
    immersion: number // 몰입력
    anticipation: number // 기대감
  }
  comments: { nickname: string; content: string }[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateAiAnalysisRequestBody {
  usePreviousSummary?: boolean
}
