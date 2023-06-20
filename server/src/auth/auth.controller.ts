import {
  Controller,
  Get,
  UseGuards,
  Request,
  Res,
  Redirect,
} from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { AuthService } from "./auth.service"
import { Response } from "express"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@Controller("api/auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("login")
  @UseGuards(AuthGuard("kimustory"))
  @ApiOperation({
    summary: "키뮤스토리 계정으로 로그인하기",
    description: "키뮤스토리 계정으로 로그인합니다.",
  })
  @Redirect()
  async login(@Request() req, @Res() res: Response) {}

  @Get("login/discord")
  @UseGuards(AuthGuard("discord"))
  @ApiOperation({
    summary: "디스코드로 로그인하기",
    description:
      "디스코드 계정으로 로그인합니다. 키뮤스토리 계정 로그인으로 대체될 예정입니다.",
    deprecated: true,
  })
  @Redirect()
  async loginDiscord(@Request() req, @Res() res: Response) {
    const loginResult = await this.authService.login(req.user)
    console.debug(loginResult.accessToken)
    return { url: "/auth/callback?token=" + loginResult.accessToken }
  }
}
