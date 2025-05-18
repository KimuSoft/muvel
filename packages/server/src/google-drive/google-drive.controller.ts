import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common"
import { GoogleDriveService } from "./services/google-drive.service"
import { Response } from "express"
import {
  GoogleAuthenticatedRequest,
  GoogleAuthGuard,
} from "./google-auth.guard"
import { RequireAuth } from "../auth/guards/jwt-auth.guard" // 👈 import custom guard

@Controller("google-drive")
export class GoogleDriveController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Get("connect")
  @UseGuards(GoogleAuthGuard)
  connect() {
    // 구글 OAuth 리디렉션 (AuthGuard가 자동 처리)
  }

  /**
   * Google OAuth 인증 후 돌아오는 리디렉션 엔드포인트.
   * Google 계정 정보와 토큰을 수신하여 사용자 계정에 연결 처리.
   */
  @Get("redirect")
  @RequireAuth()
  @UseGuards(GoogleAuthGuard)
  async handleRedirect(
    @Req() req: GoogleAuthenticatedRequest,
    @Res() res: Response,
  ) {
    const userId = req.user.id // 인증된 사용자 정보
    const { accessToken, refreshToken, profile } = req.googleOAuthResult

    await this.googleDriveService.handleGoogleLogin({
      accessToken,
      refreshToken,
      profile,
      userId,
    })

    res.redirect("/settings/storage")
  }
}
