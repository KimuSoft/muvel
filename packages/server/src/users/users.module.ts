import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "./user.entity"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"
import { NovelEntity } from "../novels/novel.entity"
import { EpisodeEntity } from "../episodes/entities/episode.entity"
import { NovelsModule } from "../novels/novels.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, NovelEntity, EpisodeEntity]),
    NovelsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
