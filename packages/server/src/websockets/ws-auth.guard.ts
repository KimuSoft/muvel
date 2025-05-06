// src/websockets/ws-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { WsException } from "@nestjs/websockets"

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const client = ctx.switchToWs().getClient()
    const token =
      client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization?.split("Bearer ")[1]

    if (!token) throw new WsException("Missing token")

    try {
      const payload = this.jwt.verify(token)
      client.user = payload // 커스텀 프로퍼티
      return true
    } catch {
      throw new WsException("Invalid/Expired token")
    }
  }
}
