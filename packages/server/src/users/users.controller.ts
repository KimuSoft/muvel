import {
  Controller,
  Get,
  Param,
  Req,
  Request,
  UseInterceptors,
} from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { UsersService } from "./users.service"
import { NovelsService } from "../novels/services/novels.service"
import {
  AuthenticatedRequest,
  OptionalAuth,
  OptionalAuthenticatedRequest,
  RequireAuth,
} from "../auth/guards/jwt-auth.guard"
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager"

@Controller("users")
@ApiTags("Users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly novelsService: NovelsService,
  ) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(10 * 60 * 1000) // 10분 (600초)
  @Get("count")
  @ApiOperation({
    summary: "유저 수 불러오기",
    description: "현재 가입한 총 유저 수를 불러옵니다.",
  })
  async getUserCount() {
    console.log("getUserCount")
    return this.usersService.getUserCount()
  }

  @Get("me")
  @RequireAuth()
  @ApiOperation({
    summary: "내 정보 불러오기",
    description: "내 정보를 불러옵니다.",
  })
  getMe(@Request() req: AuthenticatedRequest) {
    return this.usersService.findUserById(req.user.id)
  }

  @Get("recent-novels")
  @RequireAuth()
  async getRecentNovels(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id
    return this.usersService.getRecentNovels(userId)
  }

  @Get(":id")
  @ApiOperation({
    summary: "유저 정보 불러오기",
    description: "유저의 정보를 불러옵니다. (다른 사람이)",
  })
  async getUser(@Param("id") id: string) {
    return this.usersService.findUserByIdPublic(id)
  }

  @Get(":id/novels")
  @ApiOperation({
    summary: "유저가 작성한 소설 불러오기",
    description: "유저가 작성한 소설을 불러옵니다.",
  })
  @OptionalAuth()
  async getNovels(
    @Req() req: OptionalAuthenticatedRequest,
    @Param("id") id: string,
  ) {
    return this.novelsService.findNovelsByUserId(id, req.user?.id === id)
  }
}
