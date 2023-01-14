import { Controller, Get, Request, Query } from "@nestjs/common"
import { AppService } from "../app.service"
import { EpisodesService } from "./episodes.service"

@Controller("api/episodes")
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Get()
  async getEpisodes(
    @Request() req,
    @Query("id") id: number,
    @Query("loadBlocks") loadBlocks: boolean = false,
    @Query("loadNovel") loadNovel: boolean = false
  ) {
    return this.episodesService.findOne(id, [
      ...(loadBlocks ? ["blocks"] : []),
      ...(loadNovel ? ["novel"] : []),
    ])
  }
}
