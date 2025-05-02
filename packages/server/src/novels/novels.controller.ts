import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from "@nestjs/common"
import { NovelsService } from "./services/novels.service"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { UpdateNovelDto } from "./dto/update-novel.dto"
import { CreateEpisodeDto } from "../episodes/dto/create-episode.dto"
import { SearchNovelsDto } from "./dto/search-novels.dto"
import { PatchEpisodesDto } from "./dto/patch-episodes.dto"
import { SearchRepository } from "../search/search.repository"
import { SearchInNovelDto } from "../search/dto/search-in-novel.dto"
import { EpisodesService } from "../episodes/services/episodes.service"
import { ExportNovelResponseDto, GetNovelResponseDto } from "muvel-api-types"
import { AuthenticatedRequest, RequireAuth } from "../auth/jwt-auth.guard"
import { CreateNovelDto } from "./dto/create-novel.dto"
import { RequirePermission } from "../permissions/require-permission.decorator"
import {
  NovelPermissionGuard,
  NovelPermissionRequest,
} from "../permissions/novel-permission.guard"
import { UuIdParamDto } from "../utils/UuIdParamDto"
import { UsersService } from "../users/users.service"

@ApiTags("Novels")
@Controller("novels")
export class NovelsController {
  constructor(
    private readonly novelsService: NovelsService,
    private readonly episodesService: EpisodesService,
    private readonly searchService: SearchRepository,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({
    summary: "소설 검색하기",
    description: "소설을 검색합니다.",
  })
  async searchNovels(@Query() searchNovelsDto: SearchNovelsDto) {
    return this.novelsService.searchNovel(searchNovelsDto)
  }

  @Post()
  @ApiOperation({
    summary: "새 소설 생성하기",
    description: "새로운 소설을 추가합니다.",
  })
  @RequireAuth()
  async createNovel(
    @Request() req: AuthenticatedRequest,
    @Body() createNovelDto: CreateNovelDto,
  ) {
    return this.novelsService.createNovel(req.user, createNovelDto)
  }

  @Get(":id")
  @ApiOperation({
    summary: "소설 정보 불러오기",
    description:
      "소설의 정보를 불러옵니다. 소설 정보에는 회차 정보가 포함되어 있으며, 에피소드는 회차 순서대로 정렬됩니다.",
  })
  @RequirePermission("read", NovelPermissionGuard)
  async getNovel(
    @Request() req: NovelPermissionRequest,
    @Param() { id }: UuIdParamDto,
  ): Promise<GetNovelResponseDto> {
    if (req.user?.id) {
      // 최근에 접속한 소설 업데이트
      void this.usersService.updateLastAccessedNovel(req.user.id, id)
    }
    return this.novelsService.findNovelById(id, req.novel?.permissions)
  }

  @Get(":id/export")
  @ApiOperation({
    summary: "소설 백업하기",
    description: "소설의 전체 내용을 json으로 다운받습니다.",
  })
  @RequirePermission("edit", NovelPermissionGuard)
  async exportNovel(@Param("id") id: string): Promise<ExportNovelResponseDto> {
    const novel = await this.novelsService.exportNovel(id)
    if (!novel) throw new NotFoundException("소설을 찾을 수 없습니다.")

    return novel
  }

  @Patch(":id")
  @ApiOperation({
    summary: "소설 정보 수정하기",
    description: "소설의 정보를 수정합니다.",
  })
  @RequirePermission("edit", NovelPermissionGuard)
  async updateNovel(
    @Param("id") id: string,
    @Body() novelUpdateDto: UpdateNovelDto,
  ) {
    return this.novelsService.updateNovel(id, novelUpdateDto)
  }

  @Delete(":id")
  @ApiOperation({
    summary: "소설 삭제하기",
    description: "소설을 삭제합니다.",
  })
  @RequirePermission("delete", NovelPermissionGuard)
  async deleteNovel(@Param("id") id: string) {
    return this.novelsService.delete(id)
  }

  @Post(":id/episodes")
  @ApiOperation({
    summary: "에피소드 추가하기",
    description: "해당 소설에 새로운 에피소드를 추가합니다.",
  })
  @RequirePermission("edit", NovelPermissionGuard)
  async addEpisode(
    @Param("id") id: string,
    @Body() createEpisodeDto: CreateEpisodeDto,
  ) {
    return this.episodesService.createEpisode(id, createEpisodeDto)
  }

  @Patch(":id/episodes")
  @ApiOperation({
    summary: "에피소드 수정하기",
    description: "해당 소설의 에피소드를 수정합니다. (현재는 order만 가능)",
  })
  @RequirePermission("edit", NovelPermissionGuard)
  async patchEpisodes(
    @Param("id") id: string,
    @Body() dto: PatchEpisodesDto[],
  ) {
    return this.episodesService.patchEpisodes(id, dto)
  }

  @Get(":id/search")
  @ApiOperation({
    summary: "소설 안에서 검색하기",
    description:
      "소설 안의 블록, 설정, 캐릭터 문서 등을 검색합니다. (powered by Meilisearch)",
  })
  @RequirePermission("edit", NovelPermissionGuard)
  async searchInNovel(
    @Param("id") id: string,
    @Query() searchInNovelDto: SearchInNovelDto,
  ) {
    return this.searchService.searchBlocksByNovel(id, searchInNovelDto)
  }
}
