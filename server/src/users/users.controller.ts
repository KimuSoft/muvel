import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Request,
} from "@nestjs/common"
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { UserDto } from "./dto/user.dto"
import { RequireAuth } from "../auth/auth.decorator"
import { NovelDto } from "../novels/dto/novel.dto"
import { UsersService } from "./users.service"
import { NovelsService } from "../novels/novels.service"
import { CreateNovelDto } from "./dto/create-novel.dto"

@Controller("api/users")
@ApiTags("Users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly novelsService: NovelsService
  ) {}

  @Get("me")
  @RequireAuth()
  @ApiOperation({
    summary: "내 정보 불러오기",
    description: "내 정보를 불러옵니다.",
  })
  @ApiOkResponse({ type: UserDto })
  getMe(@Request() req) {
    return req.user
  }

  @Get(":id/novels")
  @ApiOperation({
    summary: "유저가 작성한 소설 불러오기",
    description: "유저가 작성한 소설을 불러옵니다.",
  })
  @ApiOkResponse({ type: NovelDto, isArray: true })
  async getNovels(@Param("id") id: string) {
    return this.usersService.getNovels(id)
  }

  @Post(":id/novels")
  @ApiOperation({
    summary: "새 소설 생성하기",
    description: "새로운 소설을 추가합니다.",
  })
  @ApiOkResponse({
    description: "추가된 소설 정보를 반환합니다.",
    type: NovelDto,
  })
  @RequireAuth()
  async createNovel(
    @Request() req,
    @Param("id") userId: string,
    @Body() createNovelDto: CreateNovelDto
  ) {
    if (req.user.id !== userId) throw new ForbiddenException()

    return this.novelsService.create(
      userId,
      createNovelDto.title,
      createNovelDto.description
    )
  }
}
