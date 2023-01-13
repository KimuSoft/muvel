import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Novel } from "./novel.entity"
import { NovelsService } from "./novels.service"
import { EpisodesModule } from "../episodes/episodes.module"

@Module({
  imports: [TypeOrmModule.forFeature([Novel]), EpisodesModule],
  exports: [NovelsService],
  providers: [NovelsService],
})
export class NovelsModule {}
