import { Controller, Post } from "@nestjs/common"
import { ApiOperation } from "@nestjs/swagger"
import { SearchService } from "./search.service"

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post("cache/refresh")
  @ApiOperation({
    summary: "에피소드 meilisearch 검색 캐시 갱신하기",
  })
  async refreshCache() {
    await this.searchService.insertAllBlocksToCache()
    return "done!"
  }
}
