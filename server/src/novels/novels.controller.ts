import {
  ArgumentMetadata,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Injectable,
  Param,
  ParseFilePipeBuilder,
  PipeTransform,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common"
import { NovelsService } from "./novels.service"
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { NovelDto, NovelDtoWithEpisodes } from "./dto/novel.dto"
import { UpdateNovelDto } from "./dto/update-novel.dto"
import { EpisodeDto } from "../episodes/dto/episode.dto"
import { CreateEpisodeDto } from "./dto/create-episode.dto"
import {
  RequirePermissionToEditNovel,
  RequirePermissionToReadNovel,
} from "./novels.decorator"
import {
  SearchNovelsDto,
  SearchNovelsResponseDto,
} from "./dto/search-novels.dto"
import { FileInterceptor } from "@nestjs/platform-express"

@ApiTags("Novels")
@Controller("api/novels")
export class NovelsController {
  constructor(private readonly novelsService: NovelsService) {}

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
  @RequirePermissionToReadNovel()
  async getNovels(@Request() req, @Param("id") id: string) {
    const novel = await this.novelsService.findOne(id, ["episodes", "author"])
    novel.episodes.sort((a, b) => a.order - b.order)

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
    @Body() addEpisodeDto: CreateEpisodeDto
  ) {
    return this.novelsService.addEpisode(
      id,
      addEpisodeDto.title,
      addEpisodeDto.description,
      addEpisodeDto.chapter
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

  @Post(":id/thumbnail")
  @ApiOperation({
    summary: "소설 썸네일 업로드하기",
    description: "해당 소설의 썸네일을 업로드합니다. 용량 제한은 777KB입니다.",
  })
  @RequirePermissionToEditNovel()
  @UseInterceptors(FileInterceptor("image"))
  async uploadThumbnail(
    @Param("id") id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /\.(jpe?g|png|webp|gif)$/,
        })
        .addMaxSizeValidator({ maxSize: 777 })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        })
    )
    image: Express.Multer.File
  ) {
    return this.novelsService.uploadThumbnail(id, image)
  }
}

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    return value.size < 1024 * 777
  }
}
