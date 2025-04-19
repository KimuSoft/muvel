// auth/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Request } from "express"

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest()

    // 1. 토큰을 헤더 또는 쿠키에서 추출
    const authHeader = req.headers.authorization
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null
    const cookieToken = req.cookies?.auth_token

    const token = bearerToken || cookieToken
    if (!token) throw new UnauthorizedException("No token provided")

    try {
      const decoded = await this.jwtService.verifyAsync(token)
      req.user = decoded
      return true
    } catch {
      throw new UnauthorizedException("Invalid token")
    }
  }
}
