import { Module } from "@nestjs/common"
import { SearchRepository } from "./search.repository"
import { SearchController } from "./search.controller"
import { SearchService } from "./search.service"

@Module({
  providers: [SearchRepository, SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
