import { Controller, Get, Request, Res, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { AuthService } from "./auth.service"
import { Response } from "express"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { MuvelRequest, RequireAuth } from "./auth.decorator"

@Controller("api/auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  // @Get("login")
  // @UseGuards(AuthGuard("kimustory"))
  // @ApiOperation({
  //   summary: "키뮤스토리 계정으로 로그인하기",
  //   description: "키뮤스토리 계정으로 로그인합니다.",
  // })
  // @Redirect()
  // async login(@Request() req, @Res() res: Response) {
  //   const loginResult = await this.authService.login(req.user)
  //   return { url: "/auth/callback?token=" + loginResult.accessToken }
  // }

  @Get("login")
  @UseGuards(AuthGuard("kimustory"))
  @ApiOperation({
    summary: "키뮤스토리 계정으로 로그인하기",
    description: "키뮤스토리 계정으로 로그인합니다.",
  })
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const loginResult = await this.authService.login(req.user)

    console.info(loginResult.accessToken)
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

  @Get("me")
  @RequireAuth()
  @ApiOperation({
    summary: "내 정보 가져오기",
    description: "내 정보를 가져옵니다.",
  })
  async me(@Request() req: MuvelRequest) {
    return this.authService.getUserById(req.user.id)
  }
}
