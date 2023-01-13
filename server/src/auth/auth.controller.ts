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

@Controller("api/auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard("discord"))
  @Get("login/discord")
  @Redirect()
  async loginDiscord(@Request() req, @Res() res: Response) {
    const loginResult = await this.authService.login(req.user)
    return { url: "/auth/callback?token=" + loginResult.accessToken }
  }
}
