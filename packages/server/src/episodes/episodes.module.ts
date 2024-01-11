import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EpisodeEntity } from "./episode.entity"
import { EpisodesService } from "./episodes.service"
import { EpisodesController } from "./episodes.controller"
import { SearchRepository } from "../search/search.repository"
import { BlocksService } from "../blocks/blocks.service"
import { NovelEntity } from "../novels/novel.entity"
import { BlockEntity } from "../blocks/block.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([NovelEntity, EpisodeEntity, BlockEntity]),
  ],
  exports: [EpisodesService],
  providers: [EpisodesService, BlocksService, SearchRepository],
  controllers: [EpisodesController],
})
export class EpisodesModule {}
