import { Controller, Get, Request, Res, UseGuards } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { Response } from "express"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { AuthenticatedRequest } from "./jwt-auth.guard"
import { KimustoryAuthGuard } from "./kimustory-auth.guard"

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("login")
  @UseGuards(KimustoryAuthGuard)
  @ApiOperation({
    summary: "키뮤스토리 계정으로 로그인하기",
    description: "키뮤스토리 계정으로 로그인합니다.",
  })
  async login(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginResult = await this.authService.login(req.user)
    const flow = req.user._authFlow

    switch (flow) {
      case "desktop": {
        return res.redirect(
          `http://localhost:53682/callback?token=${encodeURIComponent(loginResult.accessToken)}`,
        )
      }

      case "mobile": {
        return res.redirect(
          `muvel://oauth/callback?token=${encodeURIComponent(loginResult.accessToken)}`,
        )
      }

      default: {
        res.cookie("auth_token", loginResult.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 1000 * 60 * 60 * 24 * 7,
        })
        res.redirect("/")
      }
    }
  }
}
