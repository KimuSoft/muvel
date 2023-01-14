import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Novel } from "./novel.entity"
import { NovelsService } from "./novels.service"
import { EpisodesModule } from "../episodes/episodes.module"
import { NovelsController } from './novels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Novel]), EpisodesModule],
  exports: [NovelsService],
  providers: [NovelsService],
  controllers: [NovelsController],
})
export class NovelsModule {}
