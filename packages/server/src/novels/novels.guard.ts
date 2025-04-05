import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { NovelsService } from "./novels.service"
import { Reflector } from "@nestjs/core"

@Injectable()
export class NovelsGuard implements CanActivate {
  constructor(
    private readonly novelsService: NovelsService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const id: string = request.params.id

    const reqPermission = this.reflector.get<string>(
      "permission",
      context.getHandler()
    )

    if (!reqPermission) return true

    const paths = request.path.split("/")

    const endpoints = ["novels", "episodes", "blocks"]
    let endpoint = paths[paths.length - 2] as "novels" | "episodes"

    if (!endpoints.includes(endpoint))
      endpoint = paths[paths.length - 3] as "novels" | "episodes"

    if (!id.match(/^[a-f\d]{8}(-[a-f\d]{4}){4}[a-f\d]{8}$/i))
      throw new NotFoundException()

    let novelId: string
    switch (endpoint) {
      case "novels":
        novelId = id
        break
      case "episodes":
        novelId = (await this.novelsService.getNovelByEpisodeId(id))?.id
        break
      default:
        throw new Error("Invalid endpoint:" + request.path)
    }

    if (!novelId) throw new Error("Cannot get novel ID")

    const userId: string = request.user?.id

    if (!request.user) request.user = { permissions: [] }

    request.user.permissions = await this.novelsService.getPermission(
      novelId,
      userId
    )

    console.info(
      request.method,
      request.path,
      request.user.permissions.includes(reqPermission)
    )
    return request.user.permissions.includes(reqPermission)
  }
}
