import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "./user.entity"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"
import { NovelsService } from "../novels/services/novels.service"
import { NovelEntity } from "../novels/novel.entity"
import { EpisodeEntity } from "../episodes/entities/episode.entity"
import { EpisodeRepository } from "../episodes/repositories/episode.repository"

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, NovelEntity, EpisodeEntity])],
  providers: [UsersService, NovelsService, EpisodeRepository],
  controllers: [UsersController],
})
export class UsersModule {}
