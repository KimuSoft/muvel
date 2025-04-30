// auth/jwt-auth.guard.ts
import {
  applyDecorators,
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Request } from "express"
import { extractTokenFromRequest } from "./jwt.util"
import { ApiSecurity, ApiUnauthorizedResponse } from "@nestjs/swagger"
import { NovelEntity } from "../novels/novel.entity"
import { EpisodeEntity } from "../episodes/entities/episode.entity"
import { BasePermission } from "muvel-api-types"

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    const token = extractTokenFromRequest(request)
    if (!token) throw new UnauthorizedException("No token provided")

    try {
      request.user = await this.jwtService.verifyAsync(token)

      console.info(request.method, request.path, request.user?.id, "(REQUIRED)")
      return true
    } catch {
      throw new UnauthorizedException("Invalid token")
    }
  }
}

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    const token = extractTokenFromRequest(request)
    if (!token) {
      request.user = null // 인증 없음 → null로 명시
      return true
    }

    try {
      request.user = await this.jwtService.verifyAsync(token)
    } catch {
      request.user = null // 인증 실패 → 무시하고 넘어감
    }

    console.info(request.method, request.path, request.user?.id, "(OPTIONAL)")

    return true
  }
}

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

export const OptionalAuth = () => {
  return applyDecorators(
    UseGuards(OptionalJwtAuthGuard), // 👉 커스텀 가드 적용
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

export interface UserPayload {
  id: string
  iat: number
  exp: number
}

export interface MuvelRequest extends Request {
  user?: UserPayload | null
  novel?: NovelEntity & { permissions: BasePermission }
  episode?: EpisodeEntity & { permissions: BasePermission }
}

export type AuthenticatedRequest = Request & { user: UserPayload }
