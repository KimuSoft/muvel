import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EpisodeEntity } from "./episode.entity"
import { EpisodesService } from "./episodes.service"
import { BlocksModule } from "../blocks/blocks.module"
import { EpisodesController } from "./episodes.controller"

@Module({
  imports: [TypeOrmModule.forFeature([EpisodeEntity]), BlocksModule],
  exports: [EpisodesService],
  providers: [EpisodesService],
  controllers: [EpisodesController],
})
export class EpisodesModule {}
