import { Module } from "@nestjs/common"
import { SearchRepository } from "./repositories/search.repository"
import { SearchController } from "./search.controller"

@Module({
  providers: [SearchRepository],
  controllers: [SearchController],
  exports: [SearchRepository],
})
export class SearchModule {}
