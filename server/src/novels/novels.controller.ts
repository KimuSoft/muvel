import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from "@nestjs/common"
import { NovelsService } from "./novels.service"
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { AuthGuard } from "@nestjs/passport"
import { NovelDto } from "./dto/novel.dto"
import { UpdateNovelDto } from "./dto/update-novel.dto"
import { EpisodeDto } from "../episodes/dto/episode.dto"
import { AddEpisodeDto } from "./dto/add-episode.dto"
import { RequireAuth } from "../auth/auth.decorator"
import {
  RequirePermissionToEditNovel,
  RequirePermissionToReadNovel,
} from "./novels.decorator"

@ApiTags("Novels")
@Controller("api/novels")
export class NovelsController {
  constructor(private readonly novelsService: NovelsService) {}

  @Post()
  @ApiOperation({
    summary: "소설 추가하기",
    description: "새로운 소설을 추가합니다.",
  })
  @ApiOkResponse({
    description: "추가된 소설 정보를 반환합니다.",
    type: NovelDto,
  })
  @RequireAuth()
  async createNovel(@Request() req, @Body() novelDto: NovelDto) {}

  @Get(":id")
  @ApiOperation({
    summary: "소설 정보 불러오기",
    description: "에피소드를 포함한 소설의 정보를 불러옵니다.",
  })
  @ApiOkResponse({
    description: "소설 정보를 반환합니다.",
    type: NovelDto,
  })
  @RequirePermissionToReadNovel()
  async getNovels(@Request() req, @Param("id") id: string) {
    const novel = await this.novelsService.findOne(id, ["episodes"])

    // createdAt을 기준으로 정렬 (임시)
    novel.episodes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    return novel
  }

  @Put(":id")
  @ApiOperation({
    summary: "소설 정보 수정하기",
    description: "소설의 정보를 수정합니다.",
  })
  @ApiOkResponse({
    description: "수정된 소설 정보를 반환합니다.",
    type: NovelDto,
  })
  @RequirePermissionToEditNovel()
  async updateNovel(
    @Request() req,
    @Param("id") id: string,
    @Body() novelUpdateDto: UpdateNovelDto
  ) {}

  @Delete(":id")
  @ApiOperation({
    summary: "소설 삭제하기",
    description: "소설을 삭제합니다.",
  })
  @RequirePermissionToEditNovel()
  async deleteNovel(@Request() req, @Param("id") id: string) {}

  @Post(":id/episodes")
  @ApiOperation({
    summary: "에피소드 추가하기",
    description: "해당 소설에 새로운 에피소드를 추가합니다.",
  })
  @RequirePermissionToEditNovel()
  async addEpisode(
    @Param("id") id: string,
    @Body() addEpisodeDto: AddEpisodeDto
  ) {
    return this.novelsService.addEpisode(
      id,
      addEpisodeDto.title,
      addEpisodeDto.description
    )
  }

  @Get(":id/episodes")
  @ApiOperation({
    summary: "에피소드 목록 불러오기",
    description: "해당 소설의 에피소드 목록을 불러옵니다.",
  })
  @ApiOkResponse({
    type: EpisodeDto,
    isArray: true,
  })
  @RequirePermissionToReadNovel()
  async getEpisodes(@Param("id") id: string) {}
}
