import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Request,
  UnauthorizedException,
} from "@nestjs/common"
import { EpisodesService } from "./services/episodes.service"
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { UpdateEpisodeDto } from "./dto/update-episode.dto"
import { PatchBlocksDto } from "./dto/patch-blocks.dto"
import { PartialEpisodeDto } from "./dto/episode.dto"
import { EpisodeIdParamDto } from "./dto/episode-id-param.dto"
import { EpisodeAnalysisService } from "./services/episode-analysis.service"
import { RequirePermission } from "../permissions/require-permission.decorator"
import {
  EpisodePermissionGuard,
  EpisodePermissionRequest,
} from "../permissions/episode-permission.guard"
import { CreateAiAnalysisRequestBodyDto } from "./dto/create-ai-analysis-request-body.dto"
import { CreateEpisodeSnapshotDto } from "./dto/create-episode-snapshot.dto"
import { EpisodeSnapshotService } from "./services/episode-snapshot.service"

@Controller("episodes")
@ApiTags("Episodes")
export class EpisodesController {
  constructor(
    private readonly episodesService: EpisodesService,
    private readonly episodeAnalysisService: EpisodeAnalysisService,
    private readonly episodeSnapshotService: EpisodeSnapshotService,
  ) {}

  @Get(":id")
  @ApiOperation({
    summary: "에피소드 정보 불러오기",
    description: "에피소드의 정보를 불러옵니다.",
  })
  @RequirePermission("read", EpisodePermissionGuard)
  async getEpisodes(
    @Request() req: EpisodePermissionRequest,
    @Param() { id }: EpisodeIdParamDto,
  ) {
    return this.episodesService.findEpisodeById(id, req.episode.permissions)
  }

  @Patch(":id")
  @ApiOperation({
    summary: "에피소드 정보 수정하기",
    description: "에피소드의 정보를 수정합니다.",
  })
  @ApiOkResponse({ type: PartialEpisodeDto })
  @RequirePermission("edit", EpisodePermissionGuard)
  async updateEpisode(
    @Param() { id }: EpisodeIdParamDto,
    @Body() dto: UpdateEpisodeDto,
  ) {
    return this.episodesService.updateEpisode(id, dto)
  }

  @Delete(":id")
  @ApiOperation({
    summary: "에피소드 삭제하기",
    description: "에피소드를 삭제합니다.",
  })
  @RequirePermission("delete", EpisodePermissionGuard)
  async deleteEpisode(@Param() { id }: EpisodeIdParamDto) {
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
  @RequirePermission("edit", EpisodePermissionGuard)
  async patchBlocks(
    @Param() { id }: EpisodeIdParamDto,
    @Body() blockDiffs: PatchBlocksDto[],
  ) {
    return this.episodesService.updateBlocks(id, blockDiffs)
  }

  @Post(":id/analyses")
  @ApiOperation({
    summary: "AI 분석하기",
    description: "AI를 통해 에피소드를 분석합니다.",
  })
  @RequirePermission("edit", EpisodePermissionGuard)
  async aiAnalyze(
    @Req() request: EpisodePermissionRequest,
    @Param("id") episodeId: string,
    @Body() options: CreateAiAnalysisRequestBodyDto,
  ) {
    if (!request.user) throw new UnauthorizedException()
    await this.episodeAnalysisService.checkPoints(request.user.id, 100)
    const result = await this.episodeAnalysisService.createAnalysisForEpisode(
      episodeId,
      options,
    )
    await this.episodeAnalysisService.consumePoints(request.user.id, 100)
    return result
  }

  @Get(":id/analyses")
  @ApiOperation({
    summary: "AI 분석 결과 조회하기",
    description: "AI 분석 결과를 조회할 수 있습니다.",
  })
  @RequirePermission("edit", EpisodePermissionGuard)
  async getAiAnalyses(@Param("id") episodeId: string) {
    return this.episodeAnalysisService.findAnalysisByEpisodeId(episodeId)
  }

  @Get(":id/snapshots")
  @ApiOperation({
    summary: "에피소드 스냅샷 불러오기",
    description: "에피소드의 스냅샷을 불러옵니다.",
  })
  @RequirePermission("read", EpisodePermissionGuard)
  async getSnapshots(@Param("id") episodeId: string) {
    return this.episodeSnapshotService.findSnapshotsByEpisodeId(episodeId)
  }

  @Post(":id/snapshots")
  @ApiOperation({
    summary: "에피소드 스냅샷 생성하기",
    description: "에피소드의 스냅샷을 수동으로 생성합니다.",
  })
  @RequirePermission("edit", EpisodePermissionGuard)
  async createSnapshot(
    @Param("id") episodeId: string,
    @Body() dto: CreateEpisodeSnapshotDto,
  ) {
    return this.episodeSnapshotService.createSnapshot(episodeId, {
      ...dto,
      save: true,
    })
  }
}
