import { AiAnalysisEntity } from "../entities/ai-analysis.entity"
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common"
import {
  GeminiAnalysisRepository,
  GeminiAnalysisResponse,
} from "../repositories/gemini-analysis.repository"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { EpisodeRepository } from "../repositories/episode.repository"
import { EpisodeBlockRepository } from "../../blocks/repositories/episode-block.repository"
import { AiAnalysisScore, EpisodeBlockType, EpisodeType } from "muvel-api-types"
import { CreateAiAnalysisRequestBodyDto } from "../dto/create-ai-analysis-request-body.dto"
import { UserEntity } from "../../users/user.entity"

export class EpisodeAnalysisService {
  constructor(
    @InjectRepository(AiAnalysisEntity)
    private readonly aiAnalysisRepository: Repository<AiAnalysisEntity>,
    private readonly episodeRepository: EpisodeRepository,
    private readonly blockRepository: EpisodeBlockRepository,
    private readonly geminiAnalysisRepository: GeminiAnalysisRepository,
  ) {}

  async findAnalysisByEpisodeId(
    episodeId: string,
  ): Promise<AiAnalysisEntity[]> {
    return this.aiAnalysisRepository.find({
      where: { episode: { id: episodeId } },
      order: { createdAt: "DESC" },
    })
  }

  async createAnalysisForEpisode(
    episodeId: string,
    options: CreateAiAnalysisRequestBodyDto,
  ): Promise<AiAnalysisEntity> {
    // 1. 에피소드 내용을 데이터베이스에서 가져오기
    const episode = await this.episodeRepository.findOneOrFail({
      where: { id: episodeId },
      relations: ["novel"],
    })

    // 2. 해당 에피소드의 블록들을 order 순서로 가져오기
    let blocks = await this.blockRepository.findBlocksByEpisodeId(episodeId)

    blocks = blocks.filter(
      (block) => block.blockType !== EpisodeBlockType.Comment,
    )

    if (!blocks || blocks.length === 0) {
      throw new InternalServerErrorException(
        `Episode ${episodeId} has no blocks to analyze.`,
      )
    }

    const episodeContent = blocks.map((block) => block.text).join("\n")
    let analysisContent = episodeContent

    // 300자 이하면 Bad Request로 거부
    if (episodeContent.length < 300) {
      throw new BadRequestException(
        `Episode ${episodeId} content is too short for analysis.`,
      )
    }

    // 15000자 이상이어도 거부
    if (episodeContent.length > 15000) {
      throw new BadRequestException(
        `Episode ${episodeId} content is too long for analysis.`,
      )
    }

    if (!episodeContent || episodeContent.trim() === "") {
      throw new BadRequestException(
        `Episode ${episodeId} has no content to analyze.`,
      )
    }

    if (options.usePreviousSummary) {
      // 2.5. 이전 에피소드의 요약을 불러오기
      const previousEpisodes = await this.episodeRepository
        .createQueryBuilder("episode")
        .innerJoin("episode.novel", "novel")
        .where("novel.id = :novelId", { novelId: episode.novelId })
        .andWhere("episode.order < :order", { order: episode.order })
        .andWhere("episode.episodeType = :type", { type: EpisodeType.Episode })
        .andWhere("episode.description IS NOT NULL")
        .andWhere("episode.description != ''")
        .orderBy("episode.order", "ASC")
        .select(["episode.order", "episode.description"])
        .getMany()

      const previousEpisodeContent = previousEpisodes
        .map((e) => `### ${e.order}편\n${e.description}`)
        .join("\n\n")

      analysisContent = `
    # ${episode.novel.title}
    * 작품 태그: ${episode.novel.tags.join(", ")}
    ## 지난 줄거리 요약\n${previousEpisodeContent}
    ## 소설 본문\n\`\`\`${episodeContent}\`\`\``
    }

    console.info(
      `에피소드 ${episodeId} 분석 시작됨. 분석 글자 수: ${analysisContent.length} / 이전 편 분석: ${options.usePreviousSummary}`,
    )

    // 2. Gemini 분석 서비스 호출
    let analysisResult: GeminiAnalysisResponse
    try {
      analysisResult =
        await this.geminiAnalysisRepository.analyzeEpisode(analysisContent)
    } catch (error) {
      console.error(`Error analyzing episode ${episodeId}:`, error)
      throw new InternalServerErrorException(
        `Failed to get AI analysis for episode ${episodeId}.`,
      )
    }

    // 3. 분석 결과를 엔티티로 매핑 및 저장
    const newAnalysis = new AiAnalysisEntity()

    console.log(analysisResult)

    newAnalysis.overallRating = analysisResult.overallRating
    newAnalysis.scores = analysisResult.scores // scores 객체 통째로 저장 (jsonb)
    newAnalysis.comments = analysisResult.comments // comments 객체 통째로 저장 (jsonb)
    newAnalysis.episode = episode // Episode 엔티티 연결

    await this.episodeRepository.update(
      { id: episodeId },
      {
        description: analysisResult.summary,
        aiRating: analysisResult.overallRating,
      },
    )

    try {
      return this.aiAnalysisRepository.save(newAnalysis)
    } catch (error) {
      console.error(`Error saving AI analysis for episode ${episodeId}:`, error)
      throw new InternalServerErrorException(
        `Failed to save AI analysis for episode ${episodeId}.`,
      )
    }
  }

  async getAverageAnalysis(): Promise<
    AiAnalysisScore & { overallRating: number }
  > {
    return (
      await this.aiAnalysisRepository.query(`
    SELECT
      AVG("overallRating") AS "overallRating",
      AVG((scores->>'writingStyle')::float) AS "writingStyle",
      AVG((scores->>'interest')::float) AS "interest",
      AVG((scores->>'character')::float) AS "character",
      AVG((scores->>'immersion')::float) AS "immersion",
      AVG((scores->>'anticipation')::float) AS "anticipation"
    FROM ai_analyses
  `)
    )[0]
  }
}
