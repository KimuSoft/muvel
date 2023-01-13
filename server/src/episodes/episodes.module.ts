import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Episode } from "./episode.entity"
import { EpisodesService } from "./episodes.service"
import { BlocksModule } from "../blocks/blocks.module"

@Module({
  imports: [TypeOrmModule.forFeature([Episode]), BlocksModule],
  exports: [EpisodesService],
  providers: [EpisodesService],
})
export class EpisodesModule {}
