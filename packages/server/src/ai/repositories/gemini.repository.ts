import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common"
import {
  GoogleGenerativeAI,
  GenerateContentResult,
  GenerativeModel,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai"

// Gemini API 요청 시 전달할 수 있는 옵션에 대한 인터페이스 (필요에 따라 확장)
export interface GeminiRequestOptions {
  prompt: string
  systemInstruction?: string
  // 추가적인 Gemini API 파라미터 (temperature, topK, topP 등)를 여기에 포함할 수 있습니다.
  // generationConfig?: GenerationConfig;
}

@Injectable()
export class GeminiRepository {
  private readonly logger = new Logger(GeminiRepository.name)
  private genAI: GoogleGenerativeAI
  private defaultModel: GenerativeModel
  private alternativeModel: GenerativeModel // 429 또는 5xx 에러 시 사용할 대체 모델

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      this.logger.error("GEMINI_API_KEY is not set in environment variables.")
      throw new Error("GEMINI_API_KEY is not set in environment variables.")
    }
    this.genAI = new GoogleGenerativeAI(apiKey)

    // 기본 모델 설정 (환경 변수 또는 기본값 사용)
    // 안전 설정 (safetySettings)은 필요에 따라 조정할 수 있습니다.
    // 기존 GeminiAnalysisRepository에는 systemInstruction이 모델 설정에 포함되었으나,
    // 이제는 generateContent 메서드 호출 시 동적으로 전달받도록 변경합니다.
    this.defaultModel = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_DEFAULT_MODEL || "gemini-1.5-flash-latest", // 또는 "gemini-2.5-pro-exp-03-25" 등
      // safetySettings: [ // 필요한 경우 안전 설정 추가
      //   {
      //     category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      //     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      //   },
      // ],
    })

    // 대체 모델 설정 (환경 변수 또는 기본값 사용)
    this.alternativeModel = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_ALTERNATIVE_MODEL || "gemini-1.0-pro", // 또는 "gemini-2.0-flash" 등
    })
  }

  /**
   * Gemini API를 사용하여 콘텐츠를 생성합니다.
   * @param options 요청 옵션 (프롬프트, 시스템 명령어 등)
   * @returns 생성된 콘텐츠의 원시 텍스트 (주로 JSON 문자열)
   */
  async generateContent(options: GeminiRequestOptions): Promise<string> {
    const { prompt, systemInstruction } = options

    // 시스템 명령어가 있다면 모델을 해당 명령어로 다시 가져옵니다.
    // 참고: getGenerativeModel 호출 시 systemInstruction을 전달하는 것이 더 최신 방식일 수 있습니다.
    // 현재 @google/generative-ai SDK 버전에 따라 적절한 방식을 선택해야 합니다.
    // 여기서는 systemInstruction이 있다면 해당 설정을 포함하여 모델을 가져오는 것으로 가정합니다.
    const activeModelConfig = {
      model: (this.defaultModel as any).model, // 모델 이름 가져오기 (타입 단언 주의)
      ...(systemInstruction && {
        systemInstruction: {
          role: "system",
          parts: [{ text: systemInstruction }],
        },
      }),
      // safetySettings: this.defaultModel.safetySettings, // 필요시 안전 설정 복사
    }

    let modelToUse = this.genAI.getGenerativeModel(activeModelConfig)
    let alternativeModelToUse = this.alternativeModel // 대체 모델도 시스템 명령어 적용 고려 가능

    if (systemInstruction) {
      alternativeModelToUse = this.genAI.getGenerativeModel({
        model: (this.alternativeModel as any).model,
        systemInstruction: {
          role: "system",
          parts: [{ text: systemInstruction }],
        },
      })
    }

    try {
      this.logger.log(
        `Attempting to generate content with default model: ${activeModelConfig.model}`,
      )
      const result: GenerateContentResult =
        await modelToUse.generateContent(prompt)
      const response = result.response
      const text = response.text()
      this.logger.log(`Successfully generated content with default model.`)
      return text
    } catch (error: any) {
      this.logger.warn(
        `Error with default model: ${error.message}. Status: ${error.status || error.response?.status}`,
      )

      // 429 (Too Many Requests) 또는 5xx (Server Error) 발생 시 대체 모델로 전환
      if (
        error.status === 429 || // 직접적인 상태 코드 확인
        error.response?.status === 429 || // 응답 객체 내 상태 코드 확인
        (error.response?.status >= 500 && error.response?.status < 600) ||
        (error.status >= 500 && error.status < 600)
      ) {
        this.logger.warn(
          `Switching to alternative model (${(alternativeModelToUse as any).model}) due to error.`,
        )
        try {
          const result: GenerateContentResult =
            await alternativeModelToUse.generateContent(prompt)
          const response = result.response
          const text = response.text()
          this.logger.log(
            `Successfully generated content with alternative model.`,
          )
          return text
        } catch (altError: any) {
          this.logger.error(
            `Error with alternative model as well: ${altError.message}`,
          )
          throw new InternalServerErrorException(
            `Failed to generate content with AI after attempting fallback. PrimaryError: ${error.message}, FallbackError: ${altError.message}`,
          )
        }
      }
      // 그 외 오류는 그대로 throw
      throw new InternalServerErrorException(
        `Failed to generate content with AI. Error: ${error.message}`,
      )
    }
  }
}
