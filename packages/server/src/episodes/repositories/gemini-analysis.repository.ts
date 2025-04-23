// src/ai-analysis/gemini-analysis.service.ts
import { Injectable, InternalServerErrorException } from "@nestjs/common"
import { GoogleGenerativeAI } from "@google/generative-ai"
import * as process from "process" // 환경 변수 접근 (실제는 ConfigModule 사용 권장)

// Gemini API 응답 구조 타입 정의
export interface GeminiAnalysisResponse {
  overallRating: number
  scores: {
    writingStyle: number
    interest: number
    character: number
    immersion: number
    anticipation: number
  }
  comments: { nickname: string; content: string }[]
}

@Injectable()
export class GeminiAnalysisRepository {
  private genAI: GoogleGenerativeAI
  private model

  constructor() {
    // 환경 변수에서 API 키를 로드합니다. (실제 앱에서는 NestJS ConfigModule 사용 권장)
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.")
    }
    this.genAI = new GoogleGenerativeAI(apiKey)
    // 사용할 모델 지정 (예: gemini-1.5-flash-latest 또는 gemini-1.0-pro)
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    })
  }

  async analyzeEpisode(
    episodeContent: string
  ): Promise<GeminiAnalysisResponse> {
    // Gemini에게 요청할 프롬프트 구성
    // JSON 형식으로 응답하도록 명시하고, 원하는 필드와 형식을 구체적으로 지시합니다.
    const prompt = `
      다음 소설 회차 내용을 분석하여 JSON 형식으로 평가 결과를 제공해 주세요.
      평가는 종합 평점, 개별 항목 점수, 그리고 댓글 형식의 리뷰 3개로 구성됩니다.

      평가 기준:
      - 종합 평점: 0.0부터 5.0까지 0.5점 단위
      - 개별 항목 점수 (문장력, 흥미도, 캐릭터, 몰입력, 기대감): 각 항목 0.0부터 5.0까지 0.5점 단위
      - 댓글 리뷰
        - 개수는 3~10개 (재미에 따라 개수 조절)
        - 피드백, 응원, 칭찬, 기대, 웃음, 공감, 맞춤법 및 오타 지적 등의 내용
        - 각 리뷰에는 적절한 한글 닉네임 포함.
        - 실제 한국 웹소설 커뮤니티나 플랫폼 느낌(노벨피아, 조아라 등)이 나는 친근하고 가벼운 말투를 사용해주세요.
      - 만약 비판 댓글을 작성할 경우, 먼저 칭찬하는 내용을 포함하고 나서 개선점을 제시해주세요.

      소설 회차 내용:
      ${episodeContent}

      JSON 응답 형식:
      {
        "overallRating": float, // 종합 평점 (0.0 - 5.0)
        "scores": {
          "writingStyle": float, // 문장력 (0.0 - 5.0)
          "interest": float,     // 흥미도 (0.0 - 5.0)
          "character": float,  // 캐릭터 (0.0 - 5.0)
          "immersion": float,  // 몰입력 (0.0 - 5.0)
          "anticipation": float  // 기대감 (0.0 - 5.0)
        },
        "comments": [
          { "nickname": "string", "content": "string" },
          // 추가 댓글들...
        ]
      }
      반드시 이 JSON 형식만 응답해주세요. 서론이나 추가 설명은 포함하지 마세요.
      `

    try {
      const result = await this.model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      // Gemini 응답에서 JSON 파싱
      // Sometimes Gemini might include markdown ```json ... ```
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/)
      const jsonString = jsonMatch ? jsonMatch[1] : text

      const analysisResult: GeminiAnalysisResponse = JSON.parse(jsonString)

      // 간단한 유효성 검사 (응답 구조가 예상과 다를 경우 대비)
      if (
        typeof analysisResult.overallRating !== "number" ||
        typeof analysisResult.scores?.writingStyle !== "number" // TODO: 더 철저한 유효성 검사 추가
      ) {
        throw new Error("Invalid response structure from Gemini API")
      }

      // 점수 범위를 0.0 ~ 5.0, 0.5 단위로 맞추기 (선택 사항, Gemini가 잘 맞춰주지만 혹시 모를 경우)
      analysisResult.overallRating =
        Math.round(analysisResult.overallRating * 2) / 2
      for (const key in analysisResult.scores) {
        analysisResult.scores[key] =
          Math.round(analysisResult.scores[key] * 2) / 2
      }

      return analysisResult
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      // 에러 로깅 및 적절한 예외 발생
      throw new InternalServerErrorException(
        "Failed to analyze episode content with AI."
      )
    }
  }
}
