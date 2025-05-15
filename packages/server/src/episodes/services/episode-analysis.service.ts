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
import { BlockRepository } from "../../blocks/block.repository"
import { AiAnalysisScore, BlockType, EpisodeType } from "muvel-api-types"
import { CreateAiAnalysisRequestBodyDto } from "../dto/create-ai-analysis-request-body.dto"
import { UserEntity } from "../../users/user.entity"

export class EpisodeAnalysisService {
  constructor(
    @InjectRepository(AiAnalysisEntity)
    private readonly aiAnalysisRepository: Repository<AiAnalysisEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly episodeRepository: EpisodeRepository,
    private readonly blockRepository: BlockRepository,
    private readonly geminiAnalysisRepository: GeminiAnalysisRepository,
  ) {}

  // 포인트를 체크하고 소비시키는 메서드 (TODO: 나중에 유저서비스로 이동)
  async checkPoints(userId: string, point: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }

    if (user.point < point) {
      throw new BadRequestException(
        `User with ID ${userId} does not have enough points.`,
      )
    }
  }

  // 포인트를 체크하고 소비시키는 메서드 (TODO: 나중에 유저서비스로 이동)
  async consumePoints(userId: string, point: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }

    if (user.point < point) {
      throw new BadRequestException(
        `User with ID ${userId} does not have enough points.`,
      )
    }

    user.point -= point

    await this.userRepository.save(user)
  }

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
    const episode = await this.episodeRepository.findOne({
      where: { id: episodeId },
    })

    if (!episode) {
      throw new NotFoundException(`Episode with ID ${episodeId} not found`)
    }

    // 2. 해당 에피소드의 블록들을 order 순서로 가져오기
    let blocks = await this.blockRepository.findBlocksByEpisodeId(episodeId)

    blocks = blocks.filter((block) => block.blockType !== BlockType.Comment)

    if (!blocks || blocks.length === 0) {
      // 블록이 없어도 분석할 내용이 없으므로 에러 또는 특정 처리 필요
      throw new InternalServerErrorException(
        `Episode ${episodeId} has no blocks to analyze.`,
      )
      // 또는 빈 내용으로 분석을 진행하거나 (AI 응답이 이상할 수 있음), 다른 처리를 할 수 있습니다.
      // const episodeContent = '';
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

      console.log(previousEpisodeContent)

      analysisContent = `
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
      { description: analysisResult.summary },
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
