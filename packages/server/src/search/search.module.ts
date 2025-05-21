// src/search/search.module.ts
import { forwardRef, Module } from "@nestjs/common"
import { SearchRepository } from "./search.repository"
import { SearchController } from "./search.controller"
import { SearchService } from "./search.service"
import { TypeOrmModule } from "@nestjs/typeorm" // EpisodeRepository 주입을 위해 필요
import { EpisodeEntity } from "../episodes/entities/episode.entity"
import { EpisodesModule } from "../episodes/episodes.module"
import { UserEntity } from "../users/user.entity" // EpisodeEntity 임포트

@Module({
  imports: [
    TypeOrmModule.forFeature([EpisodeEntity, UserEntity]),
    forwardRef(() => EpisodesModule),
  ],
  providers: [SearchRepository, SearchService],
  controllers: [SearchController],
  exports: [SearchRepository, SearchService],
})
export class SearchModule {}
