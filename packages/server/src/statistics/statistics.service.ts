import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "../users/user.entity"
import { Repository } from "typeorm"
import { NovelEntity } from "../novels/novel.entity"
import { EpisodeEntity } from "../episodes/entities/episode.entity"
import { BlockEntity } from "../blocks/block.entity"

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(NovelEntity)
    private readonly novelRepository: Repository<NovelEntity>,
    @InjectRepository(EpisodeEntity)
    private readonly episodeRepository: Repository<EpisodeEntity>,
    @InjectRepository(BlockEntity)
    private readonly blockRepository: Repository<BlockEntity>,
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
}
