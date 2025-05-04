import { Controller, Get, Request, Res, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { AuthService } from "./auth.service"
import { Response } from "express"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { AuthenticatedRequest } from "./jwt-auth.guard"

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("login")
  @UseGuards(AuthGuard("kimustory"))
  @ApiOperation({
    summary: "키뮤스토리 계정으로 로그인하기",
    description: "키뮤스토리 계정으로 로그인합니다.",
  })
  async login(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginResult = await this.authService.login(req.user)

    // 쿠키 직접 설정
    res.cookie("auth_token", loginResult.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    // 리디렉트
    res.redirect("/")
  }
}
