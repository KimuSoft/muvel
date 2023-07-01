import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Request,
} from "@nestjs/common"
import { EpisodesService } from "./episodes.service"
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { BlockDto } from "../blocks/dto/block.dto"
import { UpdateEpisodeDto } from "./dto/update-episode.dto"
import { PatchBlocksDto } from "./dto/patch-blocks.dto"
import { EpisodeDto } from "./dto/episode.dto"
import { RequirePermission } from "../novels/novels.decorator"
import { NovelPermission } from "../types"

@Controller("api/episodes")
@ApiTags("Episodes")
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Get(":id")
  @ApiOperation({
    summary: "에피소드 정보 불러오기",
    description: "에피소드의 정보를 불러옵니다.",
  })
  @ApiOkResponse({ type: EpisodeDto })
  @RequirePermission(NovelPermission.ReadNovel)
  async getEpisodes(@Request() req, @Param("id") id: string) {
    return this.episodesService.findOne(id, [])
  }

  @Put(":id")
  @ApiOperation({
    summary: "에피소드 정보 수정하기",
    description: "에피소드의 정보를 수정합니다.",
  })
  @RequirePermission(NovelPermission.EditNovel)
  async updateEpisode(
    @Request() req,
    @Param("id") id: string,
    @Body() updateEpisodeDto: UpdateEpisodeDto
  ) {
    return this.episodesService.update(
      id,
      updateEpisodeDto.chapter,
      updateEpisodeDto.title,
      updateEpisodeDto.description
    )
  }

  @Delete(":id")
  @ApiOperation({
    summary: "에피소드 삭제하기",
    description: "에피소드를 삭제합니다.",
  })
  @RequirePermission(NovelPermission.EditNovel)
  async deleteEpisode(@Request() req, @Param("id") id: string) {
    return this.episodesService.deleteEpisode(id)
  }

  @Get(":id/blocks")
  @ApiOperation({
    summary: "에피소드 내 블록 불러오기",
    description: "에피소드의 블록을 불러옵니다.",
  })
  @ApiOkResponse({
    type: BlockDto,
    isArray: true,
  })
  @RequirePermission(NovelPermission.ReadNovel)
  async getBlocks(@Param("id") id: string) {
    const episode = await this.episodesService.findOne(id, ["blocks"])
    episode.blocks.sort((a, b) => a.order - b.order)
    return episode.blocks
  }

  @Patch(":id/blocks")
  @ApiOperation({
    summary: "에피소드 내 블록 변경사항 적용하기",
    description: "에피소드의 블록을 수정합니다.",
  })
  @RequirePermission(NovelPermission.EditNovel)
  async patchBlocks(
    @Request() req,
    @Param("id") id: string,
    @Body() blockDiffs: PatchBlocksDto[]
  ) {
    this.episodesService.patchBlocks(id, blockDiffs).then()
  }
}
