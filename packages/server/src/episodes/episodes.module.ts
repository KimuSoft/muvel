import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EpisodeEntity } from "./entities/episode.entity"
import { EpisodesService } from "./services/episodes.service"
import { EpisodesController } from "./episodes.controller"
import { SearchRepository } from "../search/search.repository"
import { NovelEntity } from "../novels/novel.entity"
import { BlockEntity } from "../blocks/block.entity"
import { UserEntity } from "../users/user.entity"
import { AiAnalysisEntity } from "./entities/ai-analysis.entity"
import { GeminiAnalysisRepository } from "./repositories/gemini-analysis.repository"
import { EpisodeSnapshotEntity } from "./entities/episode-snapshot.entity"
import { EpisodeSnapshotService } from "./services/episode-snapshot.service"
import { EpisodeRepository } from "./repositories/episode.repository"
import { BlockRepository } from "../blocks/block.repository"
import { EpisodeAnalysisService } from "./services/episode-analysis.service"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NovelEntity,
      EpisodeEntity,
      BlockEntity,
      UserEntity,
      AiAnalysisEntity,
      EpisodeSnapshotEntity,
    ]),
  ],
  providers: [
    // repositories
    SearchRepository,
    EpisodeRepository,
    BlockRepository,
    GeminiAnalysisRepository,

    // services
    EpisodesService,
    EpisodeAnalysisService,
    EpisodeSnapshotService,
  ],
  controllers: [EpisodesController],
})
export class EpisodesModule {}
