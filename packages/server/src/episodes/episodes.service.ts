import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { EpisodeEntity } from "./episode.entity"
import { PatchEpisodesDto } from "../novels/dto/patch-episodes.dto"
import { CreateEpisodeDto } from "./dto/create-episode.dto"
import { NovelEntity } from "../novels/novel.entity"
import { ISearchRepository } from "../search/isearch.repository"
import { SearchRepository } from "src/search/search.repository"
import { BasePermission, EpisodeType } from "muvel-api-types"
import { UserEntity } from "../users/user.entity"
import { UpdateEpisodeDto } from "./dto/update-episode.dto"
import { BlockEntity } from "../blocks/block.entity"
import { PatchBlocksDto } from "./dto/patch-blocks.dto"
import { AiAnalysisEntity } from "./ai-analysis.entity"
import {
  GeminiAnalysisRepository,
  GeminiAnalysisResponse,
} from "./repositories/gemini-analysis.repository"

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(NovelEntity)
    private novelsRepository: Repository<NovelEntity>,
    @InjectRepository(EpisodeEntity)
    private episodesRepository: Repository<EpisodeEntity>,
    @InjectRepository(BlockEntity)
    private blocksRepository: Repository<BlockEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(AiAnalysisEntity)
    private aiAnalysisRepository: Repository<AiAnalysisEntity>,
    @Inject(SearchRepository)
    private readonly searchRepository: ISearchRepository,
    private readonly geminiAnalysisRepository: GeminiAnalysisRepository
  ) {}

  private async getNextOrder(
    episodeType: EpisodeType,
    novelId?: string
  ): Promise<string> {
    if (!novelId) return (1).toString()

    const lastBlock: { order: string }[] = await this.episodesRepository.query(
      'SELECT * FROM "episode" WHERE "novelId" = $1 ORDER BY "order" DESC LIMIT 1',
      [novelId]
    )
    return (
      episodeType === EpisodeType.Episode
        ? Math.floor(parseFloat(lastBlock?.[0].order)) + 1
        : parseFloat(lastBlock?.[0].order) + 1 / 10000
    ).toString()
  }

  async findEpisodeById(id: string, userId: string) {
    const episode = await this.episodesRepository.findOne({
      where: { id },
      relations: ["novel", "novel.author", "blocks"],
    })

    if (!episode) throw new NotFoundException(`Episode with id ${id} not found`)

    // 유저 정보 불러오기
    const user = await this.usersRepository.findOneBy({ id: userId })
    const permissions: BasePermission = {
      read: true,
      edit: this.canEdit(episode.novel, user),
      delete: this.canEdit(episode.novel, user),
    }

    return {
      ...episode,
      permissions,
    }
  }

  async createEpisode(novelId: string, createEpisodeDto: CreateEpisodeDto) {
    const novel = await this.novelsRepository.findOne({
      where: { id: novelId },
      relations: ["episodes"],
    })
    if (!novel) return null

    const order =
      createEpisodeDto.order ??
      (await this.getNextOrder(
        createEpisodeDto.episodeType || EpisodeType.Episode,
        novelId
      ))

    const episode = new EpisodeEntity()
    episode.title = createEpisodeDto.title
    episode.description = createEpisodeDto.description || ""
    episode.episodeType = createEpisodeDto.episodeType
    episode.order = order
    await this.episodesRepository.save(episode)

    novel.episodes.push(episode)
    await this.novelsRepository.save(novel)

    return episode
  }

  async patchEpisodes(_id: string, episodesDiff: PatchEpisodesDto[]) {
    await this.upsert(episodesDiff)
  }

  async findOne(id: string, relations: string[] = []) {
    return this.episodesRepository.findOne({
      where: { id },
      relations,
    })
  }

  async deleteEpisode(id: string) {
    await this.findOne(id, ["blocks"])
    return this.episodesRepository.delete(id)
  }

  async updateEpisode(id: string, dto: UpdateEpisodeDto) {
    return this.episodesRepository.update({ id }, dto)
  }

  async upsert(episodes: PatchEpisodesDto[]) {
    return this.episodesRepository.upsert(episodes, ["id"])
  }

  async insertAllBlocksToCache() {
    const episodes = await this.episodesRepository
      .createQueryBuilder("episode")
      .leftJoinAndSelect("episode.blocks", "block")
      .getMany()

    const blocks = []

    for (const episode of episodes) {
      for (const block of episode.blocks) {
        blocks.push({
          id: block.id,
          content: block.content,
          blockType: block.blockType,
          order: block.order,
          episodeId: episode.id,
          episodeName: episode.title,
          episodeNumber: episode.order,
          index: block.order,
          novelId: episode.novelId,
        })
      }
    }

    return this.searchRepository.insertBlocks(blocks)
  }

  async updateBlocks(episodeId: string, blockDiffs: PatchBlocksDto[]) {
    const episode = await this.episodesRepository.findOneBy({ id: episodeId })
    if (!episode) return null

    // 블록 id 중복 있는지 확인하고 있으면 throw 401
    const blockIds = blockDiffs.map((b) => b.id)
    const uniqueBlockIds = new Set(blockIds)
    if (blockIds.length !== uniqueBlockIds.size) {
      console.warn(
        `중복된 블록 ID가 있습니다. episodeId=${episodeId}, blockIds=${blockIds}`
      )
      console.warn(blockDiffs)
      throw new BadRequestException("중복된 블록 ID가 있습니다.")
    }

    const createdOrUpdatedBlocks = blockDiffs.filter((b) => !b.isDeleted)
    const deletedBlockIds = blockDiffs
      .filter((b) => b.isDeleted)
      .map((b) => b.id)

    // 변경사항 meilisearch 저장
    void this.searchRepository.insertBlocks(
      createdOrUpdatedBlocks.map((b) => ({
        id: b.id,
        content: b.content.map((c) => c.text).join(),
        blockType: b.blockType,
        order: b.order,
        episodeId: episodeId,
        episodeName: episode.title,
        episodeNumber: episode.order,
        index: b.order,
        novelId: episode.novelId,
      }))
    )

    if (deletedBlockIds.length > 0) {
      await this.blocksRepository.delete(deletedBlockIds)
      console.info(`블록 ${deletedBlockIds.length}개 삭제됨`)
    }

    await this.blocksRepository.upsert(
      createdOrUpdatedBlocks
        .filter((b) => !b.isDeleted)
        .map((b) => ({
          id: b.id,
          content: b.content,
          text: b.content.map((c) => c.text).join(),
          blockType: b.blockType,
          order: b.order,
          episode,
        })),
      ["id"]
    )
    console.info(`블록 ${createdOrUpdatedBlocks.length}개 생성/수정됨`)
  }

  canEdit(novel: NovelEntity, user: UserEntity): boolean {
    return novel.author.id === user.id || user.admin
  }

  async findAnalysisByEpisodeId(
    episodeId: string
  ): Promise<AiAnalysisEntity[]> {
    return this.aiAnalysisRepository.find({
      where: { episode: { id: episodeId } },
      order: { createdAt: "DESC" },
    })
  }

  async createAnalysisForEpisode(episodeId: string): Promise<AiAnalysisEntity> {
    // 1. 에피소드 내용을 데이터베이스에서 가져오기
    const episode = await this.episodesRepository.findOne({
      where: { id: episodeId },
    })

    if (!episode) {
      throw new NotFoundException(`Episode with ID ${episodeId} not found`)
    }

    // 2. 해당 에피소드의 블록들을 order 순서로 가져오기
    const blocks = await this.blocksRepository.find({
      where: { episode: { id: episodeId } }, // Episode 관계를 통해 필터링
      order: { order: "ASC" }, // order 필드를 오름차순으로 정렬
    })

    if (!blocks || blocks.length === 0) {
      // 블록이 없어도 분석할 내용이 없으므로 에러 또는 특정 처리 필요
      throw new InternalServerErrorException(
        `Episode ${episodeId} has no blocks to analyze.`
      )
      // 또는 빈 내용으로 분석을 진행하거나 (AI 응답이 이상할 수 있음), 다른 처리를 할 수 있습니다.
      // const episodeContent = '';
    }

    const episodeContent = blocks.map((block) => block.text).join("\n")

    // 3000자 이하면 Bad Request로 거부
    if (episodeContent.length < 3000) {
      throw new BadRequestException(
        `Episode ${episodeId} content is too short for analysis.`
      )
    }

    // 10000자 이상이어도 거부
    if (episodeContent.length > 10000) {
      throw new BadRequestException(
        `Episode ${episodeId} content is too long for analysis.`
      )
    }

    console.info(
      `에피소드 ${episodeId} 분석 시작됨. 글자 수: ${episodeContent.length}`
    )

    if (!episodeContent || episodeContent.trim() === "") {
      throw new InternalServerErrorException(
        `Episode ${episodeId} has no content to analyze.`
      )
    }

    // 2. Gemini 분석 서비스 호출
    let analysisResult: GeminiAnalysisResponse
    try {
      analysisResult = await this.geminiAnalysisRepository.analyzeEpisode(
        episodeContent
      )
    } catch (error) {
      console.error(`Error analyzing episode ${episodeId}:`, error)
      throw new InternalServerErrorException(
        `Failed to get AI analysis for episode ${episodeId}.`
      )
    }

    // 3. 분석 결과를 엔티티로 매핑 및 저장
    const newAnalysis = new AiAnalysisEntity()

    console.log(analysisResult)

    newAnalysis.overallRating = analysisResult.overallRating
    newAnalysis.scores = analysisResult.scores // scores 객체 통째로 저장 (jsonb)
    newAnalysis.comments = analysisResult.comments // comments 객체 통째로 저장 (jsonb)
    newAnalysis.episode = episode // Episode 엔티티 연결

    try {
      return this.aiAnalysisRepository.save(newAnalysis)
    } catch (error) {
      console.error(`Error saving AI analysis for episode ${episodeId}:`, error)
      throw new InternalServerErrorException(
        `Failed to save AI analysis for episode ${episodeId}.`
      )
    }
  }
}
