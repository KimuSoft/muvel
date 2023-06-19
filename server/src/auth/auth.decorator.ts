import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  UseGuards,
} from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
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

export const RequireAdmin = () => {
  return applyDecorators(
    RequireAuth,
    AdminOnly,
    ApiForbiddenResponse({
      description: "관리자 권한이 없을 경우 거부됨",
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

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<EpRequest>()
    return req.user
  }
)

export type EpRequest = Request & { user: UserEntity }
