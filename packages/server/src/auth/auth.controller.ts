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
  async login(@Request() req, @Res() res: Response) {
    const loginResult = await this.authService.login(req.user)
    return { url: "/auth/callback?token=" + loginResult.accessToken }
  }
}
