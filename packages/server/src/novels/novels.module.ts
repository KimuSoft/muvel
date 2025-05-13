import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { NovelEntity } from "./novel.entity"
import { NovelsService } from "./services/novels.service"
import { NovelsController } from "./novels.controller"
import { UserEntity } from "../users/user.entity"
import { SearchRepository } from "../search/search.repository"
import { EpisodeEntity } from "../episodes/entities/episode.entity"
import { BlockEntity } from "../blocks/block.entity"
import { AiAnalysisEntity } from "../episodes/entities/ai-analysis.entity"
import { GeminiAnalysisRepository } from "../episodes/repositories/gemini-analysis.repository"
import { EpisodeRepository } from "../episodes/repositories/episode.repository"
import { EpisodesService } from "../episodes/services/episodes.service"
import { BlockRepository } from "../blocks/block.repository"
import { UsersService } from "../users/users.service"
import { NovelPermissionService } from "./services/novel-permission.service"
import { BlockSyncRepository } from "../episodes/repositories/block-sync.repository"

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      NovelEntity,
      EpisodeEntity,
      BlockEntity,
      AiAnalysisEntity,
    ]),
  ],
  providers: [
    // services
    NovelsService,
    NovelPermissionService,
    EpisodesService,
    UsersService,

    // repositories
    BlockRepository,
    SearchRepository,
    GeminiAnalysisRepository,
    EpisodeRepository,
    BlockSyncRepository,
  ],
  controllers: [NovelsController],
})
export class NovelsModule {}
