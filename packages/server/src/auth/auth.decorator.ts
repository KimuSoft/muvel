import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  UseGuards,
} from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger"
import { UserEntity } from "../users/user.entity"

export const RequireAuth = () => {
  return applyDecorators(
    UseGuards(AuthGuard("jwt")),
    ApiBearerAuth("access-token"),
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

export type EpRequest = Request & { user: UserEntity }
