import { Controller, Get, Query, Request } from "@nestjs/common"
import { NovelsService } from "./novels.service"

@Controller("api/novels")
export class NovelsController {
  constructor(private readonly novelsService: NovelsService) {}

  @Get()
  async getNovels(
    @Request() req,
    @Query("id") id: number,
    @Query("loadEpisodes") loadEpisodes: boolean = false
  ) {
    return this.novelsService.findOne(id, [
      ...(loadEpisodes ? ["episodes"] : []),
    ])
  }
}
