import {
  ArgumentMetadata,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Injectable,
  Param,
  Patch,
  PipeTransform,
  Post,
  Query,
  Request,
} from "@nestjs/common"
import { NovelsService } from "./novels.service"
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { NovelDto, NovelDtoWithEpisodes } from "./dto/novel.dto"
import { UpdateNovelDto } from "./dto/update-novel.dto"
import { PartialEpisodeDto } from "../episodes/dto/episode.dto"
import { CreateEpisodeDto } from "../episodes/dto/create-episode.dto"
import { RequirePermission } from "./novels.decorator"
import {
  SearchNovelsDto,
  SearchNovelsResponseDto,
} from "./dto/search-novels.dto"
import { PatchEpisodesDto } from "./dto/patch-episodes.dto"
import { NovelPermission } from "../types"
import { SearchRepository } from "../search/search.repository"
import { SearchInNovelDto } from "../search/dto/search-in-novel.dto"
import { EpisodesService } from "../episodes/episodes.service"

@ApiTags("Novels")
@Controller("api/novels")
export class NovelsController {
  constructor(
    private readonly novelsService: NovelsService,
    private readonly episodesService: EpisodesService,
    private readonly searchService: SearchRepository
  ) {}

  @Get()
  @ApiOperation({
    summary: "소설 검색하기",
    description: "소설을 검색합니다.",
  })
  @ApiOkResponse({
    type: SearchNovelsResponseDto,
    isArray: true,
  })
  async searchNovels(@Query() searchNovelsDto: SearchNovelsDto) {
    return this.novelsService.search(searchNovelsDto)
  }

  @Get(":id")
  @ApiOperation({
    summary: "소설 정보 불러오기",
    description:
      "소설의 정보를 불러옵니다. 소설 정보에는 회차 정보가 포함되어 있으며, 에피소드는 회차 순서대로 정렬됩니다.",
  })
  @ApiOkResponse({
    description: "소설 정보를 반환합니다.",
    type: NovelDtoWithEpisodes,
  })
  @RequirePermission(NovelPermission.ReadNovel)
  async getNovels(
    @Request() req,
    @Param("id") id: string
  ): Promise<NovelDtoWithEpisodes> {
    const novel = await this.novelsService.findOne(id, ["episodes", "author"])

    novel.episodes = novel.episodes.map((episode) => {
      return {
        ...episode,
        editable: req.user.novelIds.includes(episode.novelId),
      }
    })

    return novel
  }

  @Patch(":id")
  @ApiOperation({
    summary: "소설 정보 수정하기",
    description: "소설의 정보를 수정합니다.",
  })
  @ApiOkResponse({
    description: "수정된 소설 정보를 반환합니다.",
    type: NovelDto,
  })
  @RequirePermission(NovelPermission.EditNovel)
  async updateNovel(
    @Param("id") id: string,
    @Body() novelUpdateDto: UpdateNovelDto
  ): Promise<NovelDto> {
    return this.novelsService.updateNovel(id, novelUpdateDto)
  }

  @Delete(":id")
  @ApiOperation({
    summary: "소설 삭제하기",
    description: "소설을 삭제합니다.",
  })
  @RequirePermission(NovelPermission.DeleteNovel)
  async deleteNovel(@Request() req, @Param("id") id: string) {
    return this.novelsService.delete(id)
  }

  @Post(":id/episodes")
  @ApiOperation({
    summary: "에피소드 추가하기",
    description: "해당 소설에 새로운 에피소드를 추가합니다.",
  })
  @RequirePermission(NovelPermission.EditNovel)
  async addEpisode(
    @Param("id") id: string,
    @Body() createEpisodeDto: CreateEpisodeDto
  ) {
    return this.episodesService.createEpisode(id, createEpisodeDto)
  }

  @Get(":id/episodes")
  @ApiOperation({
    summary: "에피소드 목록 불러오기",
    description: "해당 소설의 에피소드 목록을 불러옵니다.",
  })
  @ApiOkResponse({
    type: PartialEpisodeDto,
    isArray: true,
  })
  @RequirePermission(NovelPermission.ReadNovel)
  async getEpisodes(@Param("id") id: string) {
    throw new ForbiddenException("Not implemented yet")
  }

  @Patch(":id/episodes")
  @ApiOperation({
    summary: "에피소드 수정하기",
    description: "해당 소설의 에피소드를 수정합니다. (현재는 order만 가능)",
  })
  @ApiBody({
    type: PatchEpisodesDto,
    isArray: true,
  })
  @RequirePermission(NovelPermission.EditNovel)
  async patchEpisodes(
    @Param("id") id: string,
    @Body() patchEpisodesDtos: PatchEpisodesDto[]
  ) {
    return this.episodesService.patchEpisodes(id, patchEpisodesDtos)
  }

  @Get(":id/search")
  @ApiOperation({
    summary: "소설 안에서 검색하기",
    description:
      "소설 안의 블록, 설정, 캐릭터 문서 등을 검색합니다. (powered by Meilisearch)",
  })
  @ApiOkResponse({
    type: SearchNovelsResponseDto,
    isArray: true,
  })
  @RequirePermission(NovelPermission.ReadNovel)
  async searchInNovel(
    @Param("id") id: string,
    @Query() searchInNovelDto: SearchInNovelDto
  ) {
    return this.searchService.searchBlocksByNovel(id, searchInNovelDto)
  }
}

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    return value.size < 1024 * 777
  }
}
