import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "../users/user.entity"
import { Repository } from "typeorm"
import { NovelEntity } from "../novels/novel.entity"
import { EpisodeEntity } from "../episodes/entities/episode.entity"
import { BlockEntity } from "../blocks/block.entity"
import { AiAnalysisEntity } from "../episodes/entities/ai-analysis.entity" // AiAnalysisEntity 임포트 추가

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name) // 로거 추가

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(NovelEntity)
    private readonly novelRepository: Repository<NovelEntity>,
    @InjectRepository(EpisodeEntity)
    private readonly episodeRepository: Repository<EpisodeEntity>,
    @InjectRepository(BlockEntity)
    private readonly blockRepository: Repository<BlockEntity>,
    @InjectRepository(AiAnalysisEntity) // AiAnalysisEntity 리포지토리 주입
    private readonly aiAnalysisRepository: Repository<AiAnalysisEntity>,
  ) {}

  public async getStatistics() {
    const totalUsers = await this.userRepository.count()
    const totalNovels = await this.novelRepository.count()
    const totalEpisodes = await this.episodeRepository.count()
    const totalBlocks = await this.blockRepository.count()

    return {
      totalUsers,
      totalNovels,
      totalEpisodes,
      totalBlocks,
    }
  }

  // 새로운 마이그레이션 스크립트 메서드
  public async migrateAiRatingFromAnalysis() {
    this.logger.log(
      "AiAnalysisEntity로부터 aiRating 마이그레이션을 시작합니다...",
    )

    const episodes = await this.episodeRepository.find()
    let updatedCount = 0

    for (const episode of episodes) {
      const latestAnalysis = await this.aiAnalysisRepository.findOne({
        where: { episode: { id: episode.id } }, // 현재 에피소드 ID로 AiAnalysisEntity 검색
        order: { createdAt: "DESC" }, // 가장 최근 데이터를 가져오기 위해 createdAt 기준으로 내림차순 정렬
      })

      if (
        latestAnalysis &&
        latestAnalysis.overallRating !== null &&
        episode.aiRating !== latestAnalysis.overallRating
      ) {
        // latestAnalysis가 존재하고, overallRating이 null이 아니며, 기존 aiRating과 다를 경우에만 업데이트
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await this.episodeRepository.update(episode.id, {
          aiRating: latestAnalysis.overallRating,
        })
        updatedCount++
        this.logger.log(
          `${episode.id} 에피소드의 aiRating을 ${latestAnalysis.overallRating}(으)로 업데이트했습니다.`,
        )
      } else if (
        latestAnalysis &&
        latestAnalysis.overallRating !== null &&
        episode.aiRating === latestAnalysis.overallRating
      ) {
        this.logger.log(
          `${episode.id} 에피소드는 이미 aiRating이 최신 상태이므로 건너<0xEB><0><0x8A>니다.`,
        )
      } else if (!latestAnalysis) {
        this.logger.log(
          `${episode.id} 에피소드에 대한 AiAnalysisEntity를 찾을 수 없습니다. 건너<0xEB><0><0x8A>니다.`,
        )
      } else if (latestAnalysis.overallRating === null) {
        this.logger.log(
          `${episode.id} 에피소드의 최신 AiAnalysisEntity의 overallRating이 null입니다. 건너<0xEB><0><0x8A>니다.`,
        )
      }
    }

    this.logger.log(
      `마이그레이션 완료. 총 ${updatedCount}개의 에피소드가 업데이트되었습니다.`,
    )
    return {
      message: `마이그레이션 완료. 총 ${updatedCount}개의 에피소드가 업데이트되었습니다.`,
    }
  }
}
