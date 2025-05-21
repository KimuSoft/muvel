import {
  Body,
  Controller,
  Delete,
  Get,
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
import { EpisodesService } from "../episodes/services/episodes.service"
import {
  AuthenticatedRequest,
  RequireAuth,
} from "../auth/guards/jwt-auth.guard"
import { CreateNovelDto } from "./dto/create-novel.dto"
import { RequirePermission } from "../permissions/require-permission.decorator"
import {
  NovelPermissionGuard,
  NovelPermissionRequest,
} from "../permissions/novel-permission.guard"
import { UuIdParamDto } from "../utils/UuIdParamDto"
import { UsersService } from "../users/users.service"
import { CreateWikiPageDto } from "../wiki-pages/dto/create-wiki-page.dto"
import { WikiPagesService } from "../wiki-pages/services/wiki-pages.service"
import { SearchInNovelDto } from "./dto/search-in-novel.dto"
import { NovelSearchItemType } from "muvel-api-types"

@ApiTags("Novels")
@Controller("novels")
export class NovelsController {
  constructor(
    private readonly novelsService: NovelsService,
    private readonly episodesService: EpisodesService,
    private readonly searchRepository: SearchRepository,
    private readonly usersService: UsersService,
    private readonly wikiPagesService: WikiPagesService,
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
  ) {
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
  async exportNovel(@Param("id") id: string) {
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
    return this.episodesService.upsertEpisode(id, dto)
  }

  @Get(":id/search")
  @ApiOperation({
    summary: "소설 안에서 검색하기",
    description:
      "소설 안의 블록, 에피소드, 위키 페이지 등을 검색합니다. itemTypes 파라미터로 검색 대상을 지정할 수 있습니다. (powered by Meilisearch)",
  })
  @RequirePermission("read", NovelPermissionGuard)
  async searchInNovel(
    @Param() { id: novelId }: UuIdParamDto,
    @Query() searchInNovelDto: SearchInNovelDto,
  ) {
    const { q, start, display, itemTypes } = searchInNovelDto

    const defaultSearchTypes = [
      NovelSearchItemType.EpisodeBlock,
      NovelSearchItemType.WikiBlock,
      NovelSearchItemType.Episode,
      NovelSearchItemType.WikiPage,
    ]
    const targetTypes =
      itemTypes && itemTypes.length > 0 ? itemTypes : defaultSearchTypes

    return this.searchRepository.searchInNovel(
      novelId,
      q || "", // q가 undefined일 경우 빈 문자열로 검색 (Meilisearch는 빈 쿼리 시 모든 문서 반환)
      {
        start: start || 0,
        display: display || 20,
        q: q || "",
        itemTypes: targetTypes,
      }, // dto를 다시 구성하거나, SearchInNovelDto를 그대로 사용
      targetTypes,
    )
  }

  @Post(":id/wiki-pages")
  @RequirePermission("edit", NovelPermissionGuard)
  @ApiOperation({ summary: "새 위키 페이지 생성" })
  async create(
    @Param("id") id: string,
    @Body() createWikiPageDto: CreateWikiPageDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return await this.wikiPagesService.createWikiPage(
      id,
      createWikiPageDto,
      req.user.id,
    )
  }
}
