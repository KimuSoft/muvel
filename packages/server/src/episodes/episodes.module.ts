import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EpisodeEntity } from "./entities/episode.entity"
import { EpisodesService } from "./services/episodes.service"
import { EpisodesController } from "./episodes.controller"
import { NovelEntity } from "../novels/novel.entity"
import { EpisodeBlockEntity } from "../blocks/entities/episode-block.entity"
import { UserEntity } from "../users/user.entity"
import { AiAnalysisEntity } from "./entities/ai-analysis.entity"
import { GeminiAnalysisRepository } from "./repositories/gemini-analysis.repository"
import { EpisodeSnapshotEntity } from "./entities/episode-snapshot.entity"
import { EpisodeSnapshotService } from "./services/episode-snapshot.service"
import { EpisodeRepository } from "./repositories/episode.repository"
import { EpisodeBlockRepository } from "../blocks/repositories/episode-block.repository"
import { EpisodeAnalysisService } from "./services/episode-analysis.service"
import { EpisodePermissionService } from "./services/episode-permission.service"
import { EpisodeBlockSyncRepository } from "../blocks/repositories/episode-block-sync.repository"
import { SearchModule } from "../search/search.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NovelEntity,
      EpisodeEntity,
      EpisodeBlockEntity,
      UserEntity,
      AiAnalysisEntity,
      EpisodeSnapshotEntity,
    ]),
    forwardRef(() => SearchModule),
  ],
  providers: [
    // repositories
    EpisodeRepository,
    EpisodeBlockRepository,
    GeminiAnalysisRepository,
    EpisodeBlockSyncRepository,

    // services
    EpisodesService,
    EpisodeAnalysisService,
    EpisodeSnapshotService,
    EpisodePermissionService,
  ],
  controllers: [EpisodesController],
  exports: [
    EpisodesService,
    EpisodeRepository,
    GeminiAnalysisRepository,
    EpisodeBlockRepository,
    EpisodeBlockSyncRepository,
  ],
})
export class EpisodesModule {}
