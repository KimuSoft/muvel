import { Controller, Get, Request, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Controller("api/users")
export class UsersController {
  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  getMe(@Request() req) {
    return req.user
  }
}
