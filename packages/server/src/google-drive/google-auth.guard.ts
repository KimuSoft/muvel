import { ExecutionContext, Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { Request } from "express"
import { AuthenticatedRequest } from "../auth/jwt-auth.guard"

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  handleRequest(err: any, user: any, _info: any, context: ExecutionContext) {
    const req: GoogleAuthenticatedRequest = context
      .switchToHttp()
      .getRequest<Request>() as GoogleAuthenticatedRequest

    if (err || !user) {
      throw err || new Error("Google authentication failed")
    }

    // 기본 req.user에 넣지 않고 custom 필드로 이동
    req["googleOAuthResult"] = user

    // return null to prevent req.user population
    return req.user as any
  }
}

export interface GoogleOAuthResult {
  accessToken: string
  refreshToken: string
  profile: {
    id: string
    displayName?: string
    emails?: { value: string }[]
    photos?: { value: string }[]
    [key: string]: any
  }
}

export interface GoogleAuthenticatedRequest extends AuthenticatedRequest {
  googleOAuthResult: GoogleOAuthResult
}
