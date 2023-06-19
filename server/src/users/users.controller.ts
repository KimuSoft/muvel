import { Controller, Get, Request, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { UserDto } from "./dto/user.dto"

@Controller("api/users")
@ApiTags("Users")
export class UsersController {
  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "내 정보 불러오기",
    description: "내 정보를 불러옵니다.",
  })
  @ApiOkResponse({ type: UserDto })
  getMe(@Request() req) {
    return req.user
  }
}
