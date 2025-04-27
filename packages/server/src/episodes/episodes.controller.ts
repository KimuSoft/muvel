import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from "@nestjs/common"
import { EpisodesService } from "./episodes.service"
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger"
import { UpdateEpisodeDto } from "./dto/update-episode.dto"
import { PatchBlocksDto } from "./dto/patch-blocks.dto"
import { PartialEpisodeDto } from "./dto/episode.dto"
import { RequirePermission } from "../novels/novels.decorator"
import { Block } from "muvel-api-types"
import { BlocksService } from "../blocks/blocks.service"
import { EpisodeIdParamDto } from "./dto/episode-id-param.dto"
import { MuvelRequest } from "../auth/auth.decorator"
import { NovelPermission } from "../novels/novel.enum"

@Controller("api/episodes")
@ApiTags("Episodes")
export class EpisodesController {
  constructor(
    private readonly episodesService: EpisodesService,
    private readonly blocksService: BlocksService
  ) {}

  @Get(":id")
  @ApiOperation({
    summary: "에피소드 정보 불러오기",
    description: "에피소드의 정보를 불러옵니다.",
  })
  @ApiNotFoundResponse()
  @ApiOkResponse({ type: PartialEpisodeDto })
  @RequirePermission(NovelPermission.ReadNovel)
  async getEpisodes(
    @Request() req: MuvelRequest,
    @Param() { id }: EpisodeIdParamDto
  ) {
    return this.episodesService.findEpisodeById(id, req.user.id)
  }

  @Patch(":id")
  @ApiOperation({
    summary: "에피소드 정보 수정하기",
    description: "에피소드의 정보를 수정합니다.",
  })
  @ApiOkResponse({ type: PartialEpisodeDto })
  @RequirePermission(NovelPermission.EditNovel)
  async updateEpisode(
    @Param() { id }: EpisodeIdParamDto,
    @Body() dto: UpdateEpisodeDto
  ) {
    return this.episodesService.updateEpisode(id, dto)
  }

  @Delete(":id")
  @ApiOperation({
    summary: "에피소드 삭제하기",
    description: "에피소드를 삭제합니다.",
  })
  @RequirePermission(NovelPermission.EditNovel)
  async deleteEpisode(@Request() req, @Param() { id }: EpisodeIdParamDto) {
    return this.episodesService.deleteEpisode(id)
  }

  // @Get(":id/blocks")
  // @ApiOperation({
  //   summary: "에피소드 내 블록 불러오기",
  //   description: "에피소드의 블록을 불러옵니다.",
  // })
  // @RequirePermission(NovelPermission.ReadNovel)
  // async getBlocks(@Param() { id }: EpisodeIdParamDto): Promise<Block[]> {
  //   const episode = await this.episodesService.findOne(id, ["blocks"])
  //   episode.blocks.sort((a, b) => a.order - b.order)
  //   return episode.blocks
  // }

  @Patch(":id/blocks")
  @ApiOperation({
    summary: "에피소드 내 블록 변경사항 적용하기",
    description: "에피소드의 블록을 수정합니다.",
  })
  @RequirePermission(NovelPermission.EditNovel)
  async patchBlocks(
    @Param() { id }: EpisodeIdParamDto,
    @Body() blockDiffs: PatchBlocksDto[]
  ) {
    return this.episodesService.updateBlocks(id, blockDiffs)
  }

  @Get(":id/search")
  @ApiOperation({
    summary: "에피소드 내 블록 검색하기",
    description: "에피소드의 블록, 캐릭터, 설정 등을 종합적으로 검색합니다.",
  })
  @RequirePermission(NovelPermission.ReadNovel)
  async searchBlocks(@Param() { id }: EpisodeIdParamDto): Promise<Block[]> {
    const episode = await this.episodesService.findOne(id, ["blocks"])
    episode.blocks.sort((a, b) => a.order - b.order)
    return episode.blocks
  }

  @Post("cache/refresh")
  @ApiOperation({
    summary: "에피소드 meilisearch 검색 캐시 갱신하기",
  })
  async refreshCache() {
    await this.episodesService.insertAllBlocksToCache()
    return "done!"
  }

  @Post(":id/analyses")
  @ApiOperation({
    summary: "AI 분석하기",
    description: "AI를 통해 에피소드를 분석합니다.",
  })
  @RequirePermission(NovelPermission.EditNovel)
  async aiAnalyze(@Param("id") episodeId: string) {
    return this.episodesService.createAnalysisForEpisode(episodeId)
  }

  @Get(":id/analyses")
  @ApiOperation({
    summary: "AI 분석하기",
    description: "AI를 통해 에피소드를 분석합니다.",
  })
  @RequirePermission(NovelPermission.ReadNovel)
  async getAiAnalyses(@Param("id") episodeId: string) {
    return this.episodesService.findAnalysisByEpisodeId(episodeId)
  }

  @Get("id:/snapshots")
  @ApiOperation({
    summary: "에피소드 스냅샷 불러오기",
    description: "에피소드의 스냅샷을 불러옵니다.",
  })
  @RequirePermission(NovelPermission.EditNovel)
  async getSnapshots(@Param("id") episodeId: string) {
    return this.episodesService.findSnapshotsByEpisodeId(episodeId)
  }
}
