// auth/jwt-auth.guard.ts
import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Request } from "express"
import { extractTokenFromRequest } from "../jwt.util"
import { ApiSecurity, ApiUnauthorizedResponse } from "@nestjs/swagger"

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest()

    const token = extractTokenFromRequest(request)
    if (!token) throw new UnauthorizedException("No token provided")

    try {
      request.user = await this.jwtService.verifyAsync(token)
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
    const request: OptionalAuthenticatedRequest = context
      .switchToHttp()
      .getRequest()

    const token = extractTokenFromRequest(request)
    if (!token) {
      request.user = null // 인증 없음 → null로 명시
      return true
    }

    try {
      request.user = await this.jwtService.verifyAsync<UserPayload>(token)
    } catch {
      request.user = null // 인증 실패 → 무시하고 넘어감
    }

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
    }),
  )
}

export const OptionalAuth = () => {
  return applyDecorators(
    UseGuards(OptionalJwtAuthGuard), // 👉 커스텀 가드 적용
    ApiSecurity("access-token"), // Bearer
    ApiSecurity("auth_token"), // Cookie
    ApiUnauthorizedResponse({
      description: "인증에 실패했을 경우 발생",
    }),
  )
}

export interface UserPayload {
  id: string
  iat: number
  exp: number
  _authFlow?: string
}

export type AuthenticatedRequest = Omit<Request, "user"> & { user: UserPayload }
export type OptionalAuthenticatedRequest = Omit<Request, "user"> & {
  user: UserPayload | null
}
