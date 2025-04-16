import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  UseGuards,
} from "@nestjs/common"
import { ApiSecurity, ApiUnauthorizedResponse } from "@nestjs/swagger"
import { UserEntity } from "../users/user.entity"
import { JwtAuthGuard } from "./jwt-auth.guard"

export const RequireAuth = () => {
  return applyDecorators(
    UseGuards(JwtAuthGuard), // 👉 커스텀 가드 적용
    ApiSecurity("access-token"), // Bearer
    ApiSecurity("auth_token"), // Cookie
    ApiUnauthorizedResponse({
      description: "인증에 실패했을 경우 발생",
    })
  )
}

export const AdminOnly = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    if (!request.user.admin) {
      throw new ForbiddenException()
    }
  }
)

export type MuvelRequest = Request & { user: UserEntity }
