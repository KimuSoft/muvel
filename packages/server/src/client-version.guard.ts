import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from "@nestjs/common"
import { Request } from "express"
import * as semver from "semver"

@Injectable()
export class ClientVersionGuard implements CanActivate {
  private readonly MIN_CLIENT_VERSION = "2.3.0"

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const clientVersion = request.headers["x-client-version"]

    console.log(clientVersion)

    // 헤더가 없으면 검사 생략 (통과)
    if (!clientVersion) {
      return true
    }

    if (typeof clientVersion !== "string") {
      throw new BadRequestException('Invalid "x-client-version" header')
    }

    if (!semver.valid(clientVersion)) {
      throw new BadRequestException(
        `Invalid version format: "${clientVersion}". Use semantic versioning.`,
      )
    }

    if (semver.lt(clientVersion, this.MIN_CLIENT_VERSION)) {
      throw new HttpException(
        {
          statusCode: 426,
          message: `Client version "${clientVersion}" is too old. Please upgrade to at least "${this.MIN_CLIENT_VERSION}".`,
          error: "Upgrade Required",
        },
        426,
      )
    }

    return true
  }
}
