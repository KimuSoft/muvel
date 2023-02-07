import { Controller, Get, Request, Query, Post, Body } from "@nestjs/common"
import { EpisodesService } from "./episodes.service"
import { BlockType } from "../types"

@Controller("api/episodes")
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Get()
  async getEpisodes(
    @Request() req,
    @Query("id") id: string,
    @Query("loadBlocks") loadBlocks: boolean = false,
    @Query("loadNovel") loadNovel: boolean = false
  ) {
    const episode = await this.episodesService.findOne(id, [
      ...(loadBlocks ? ["blocks"] : []),
      ...(loadNovel ? ["novel"] : []),
    ])

    if (loadBlocks) episode.blocks.sort((a, b) => a.order - b.order)
    return episode
  }

  @Post("update")
  async update(
    @Request() req,
    @Body()
    episode: {
      id: string
      chapter: string
      title: string
      description: string
      blocks: {
        id: string
        content: string
        blockType: BlockType
        isDeleted: boolean
        order: number
      }[]
    }
  ) {
    return this.episodesService.update(
      episode.id,
      episode.chapter,
      episode.title,
      episode.description,
      episode.blocks
    )
  }
}
