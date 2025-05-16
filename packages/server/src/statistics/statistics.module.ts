import { Module } from "@nestjs/common"
import { StatisticsService } from "./statistics.service"
import { StatisticsController } from "./statistics.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "../users/user.entity"
import { NovelEntity } from "../novels/novel.entity"
import { EpisodeEntity } from "../episodes/entities/episode.entity"
import { BlockEntity } from "../blocks/block.entity"
import { AiAnalysisEntity } from "../episodes/entities/ai-analysis.entity"

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
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
