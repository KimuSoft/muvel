import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EpisodeEntity } from "./episode.entity"
import { EpisodesService } from "./episodes.service"
import { EpisodesController } from "./episodes.controller"
import { SearchRepository } from "../search/repositories/search.repository"
import { BlocksService } from "../blocks/blocks.service"
import { NovelEntity } from "../novels/novel.entity"
import { BlockEntity } from "../blocks/block.entity"
import { UserEntity } from "../users/user.entity"
import { AiAnalysisEntity } from "./ai-analysis.entity"
import { GeminiAnalysisRepository } from "./repositories/gemini-analysis.repository"
import { EpisodeSnapshotEntity } from "./episode-snapshot.entity"
import { SnapshotService } from "./snapshot.service"

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
  exports: [EpisodesService],
  providers: [
    EpisodesService,
    BlocksService,
    SearchRepository,
    GeminiAnalysisRepository,
    SnapshotService,
  ],
  controllers: [EpisodesController],
})
export class EpisodesModule {}
