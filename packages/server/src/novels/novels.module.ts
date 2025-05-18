import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { NovelEntity } from "./novel.entity"
import { NovelsService } from "./services/novels.service"
import { NovelsController } from "./novels.controller"
import { UserEntity } from "../users/user.entity"
import { SearchRepository } from "../search/search.repository"
import { EpisodeEntity } from "../episodes/entities/episode.entity"
import { EpisodeBlockEntity } from "../blocks/entities/episode-block.entity"
import { AiAnalysisEntity } from "../episodes/entities/ai-analysis.entity"
import { GeminiAnalysisRepository } from "../episodes/repositories/gemini-analysis.repository"
import { EpisodeRepository } from "../episodes/repositories/episode.repository"
import { EpisodesService } from "../episodes/services/episodes.service"
import { EpisodeBlockRepository } from "../blocks/repositories/episode-block.repository"
import { UsersService } from "../users/users.service"
import { NovelPermissionService } from "./services/novel-permission.service"
import { EpisodeBlockSyncRepository } from "../blocks/repositories/episode-block-sync.repository"
import { WikiPagesModule } from "../wiki-pages/wiki-pages.module"
import { EpisodesModule } from "../episodes/episodes.module"
import { SearchModule } from "../search/search.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      NovelEntity,
      EpisodeEntity,
      EpisodeBlockEntity,
      AiAnalysisEntity,
    ]),
    WikiPagesModule,
    EpisodesModule,
    SearchModule,
  ],
  providers: [
    // services
    NovelsService,
    NovelPermissionService,
    UsersService,
  ],
  controllers: [NovelsController],
  exports: [NovelsService],
})
export class NovelsModule {}
