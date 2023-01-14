import { Controller, Get, Post, Query, Request } from "@nestjs/common"
import { NovelsService } from "./novels.service"

@Controller("api/novels")
export class NovelsController {
  constructor(private readonly novelsService: NovelsService) {}

  @Get()
  async getNovels(
    @Request() req,
    @Query("id") id: string,
    @Query("loadEpisodes") loadEpisodes: boolean = false
  ) {
    return this.novelsService.findOne(id, [
      ...(loadEpisodes ? ["episodes"] : []),
    ])
  }

  @Get("add-episode")
  async addEpisode(@Query("id") id: string) {
    return this.novelsService.addEpisode(
      id,
      "새 에피소드",
      "새 에피소드입니다."
    )
  }
}
