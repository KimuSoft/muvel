import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EpisodeEntity } from "./episode.entity"
import { EpisodesService } from "./episodes.service"
import { BlocksModule } from "../blocks/blocks.module"
import { EpisodesController } from "./episodes.controller"
import { SearchModule } from "../search/search.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([EpisodeEntity]),
    BlocksModule,
    SearchModule,
  ],
  exports: [EpisodesService],
  providers: [EpisodesService],
  controllers: [EpisodesController],
})
export class EpisodesModule {}
