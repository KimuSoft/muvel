import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { NovelEntity } from "./novel.entity"
import { NovelsService } from "./novels.service"
import { NovelsController } from "./novels.controller"
import { UserEntity } from "../users/user.entity"
import { EpisodesService } from "../episodes/episodes.service"
import { SearchRepository } from "../search/repositories/search.repository"
import { EpisodeEntity } from "../episodes/episode.entity"
import { BlockEntity } from "../blocks/block.entity"
import { AiAnalysisEntity } from "../episodes/ai-analysis.entity"
import { GeminiAnalysisRepository } from "../episodes/repositories/gemini-analysis.repository"

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
  exports: [NovelsService],
  providers: [
    NovelsService,
    EpisodesService,
    SearchRepository,
    GeminiAnalysisRepository,
  ],
  controllers: [NovelsController],
})
export class NovelsModule {}
