import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { NovelEntity } from "./novel.entity"
import { NovelsService } from "./novels.service"
import { EpisodesModule } from "../episodes/episodes.module"
import { NovelsController } from "./novels.controller"
import { UserEntity } from "../users/user.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([NovelEntity, UserEntity]),
    EpisodesModule,
  ],
  exports: [NovelsService],
  providers: [NovelsService],
  controllers: [NovelsController],
})
export class NovelsModule {}
