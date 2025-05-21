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
  UseInterceptors,
} from "@nestjs/common"
import { EpisodesService } from "./services/episodes.service"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { UpdateEpisodeDto } from "./dto/update-episode.dto"
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
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager"
import { SyncEpisodeBlocksDto } from "./dto/sync-episode-blocks.dto"

@Controller("episodes")
@ApiTags("Episodes")
export class EpisodesController {
  constructor(
    private readonly episodesService: EpisodesService,
    private readonly episodeAnalysisService: EpisodeAnalysisService,
    private readonly episodeSnapshotService: EpisodeSnapshotService,
  ) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 1000) // 1시간 (3600초)
  @Get("avg_analysis")
  @ApiOperation({
    summary: "AI 분석 결과 평균 조회하기",
    description: "AI 분석 결과의 평균을 조회할 수 있습니다.",
  })
  async getAvgAiAnalyses() {
    return this.episodeAnalysisService.getAverageAnalysis()
  }

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

  @Get(":id/blocks")
  @ApiOperation({
    summary: "에피소드 내 블록 불러오기",
    description: "에피소드의 블록을 불러옵니다.",
  })
  @RequirePermission("read", EpisodePermissionGuard)
  async getEpisodeBlocks(
    @Request() req: EpisodePermissionRequest,
    @Param() { id }: EpisodeIdParamDto,
  ) {
    return this.episodesService.findBlocksByEpisodeId(
      id,
      req.episode.permissions,
    )
  }

  @Patch(":id/blocks/sync")
  @ApiOperation({
    summary: "에피소드 내 블록 변경사항 적용하기 (Sync)",
    description: "에피소드의 블록을 수정합니다.",
  })
  @RequirePermission("edit", EpisodePermissionGuard)
  async syncBlocks(
    @Param() { id }: EpisodeIdParamDto,
    @Body() { deltaBlocks }: SyncEpisodeBlocksDto,
  ) {
    return await this.episodesService.episodeBlocksSync(id, deltaBlocks)
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
