import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BlockEntity } from "./block.entity"
import { BlocksService } from "./blocks.service"
import { EpisodeEntity } from "../episodes/episode.entity"
import { SearchRepository } from "../search/repositories/search.repository"

@Module({
  imports: [TypeOrmModule.forFeature([EpisodeEntity, BlockEntity])],
  exports: [BlocksService],
  providers: [BlocksService, SearchRepository],
})
export class BlocksModule {}
