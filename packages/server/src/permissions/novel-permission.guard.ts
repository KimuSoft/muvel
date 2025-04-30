import { BadRequestException, Injectable } from "@nestjs/common"
import { BasePermissionGuard } from "./base-permission.guard"
import { Reflector } from "@nestjs/core"
import { NovelsService } from "../novels/novels.service"
import { MuvelRequest } from "../auth/jwt-auth.guard"
import { NovelEntity } from "../novels/novel.entity"
import { BasePermission } from "muvel-api-types"
import { isUuid } from "../utils/isUuid"

@Injectable()
export class NovelPermissionGuard extends BasePermissionGuard<NovelEntity> {
  constructor(
    reflector: Reflector,
    private readonly novelsService: NovelsService
  ) {
    super(reflector)
  }

  getResourceId(request: MuvelRequest): string {
    return request.params.id
  }

  async getPermission(novelId: string, userId?: string) {
    if (!isUuid(novelId)) throw new BadRequestException("Invalid novel ID")
    const { novel, permissions } = await this.novelsService.getNovelPermission(
      novelId,
      userId
    )
    return { resource: novel, permissions }
  }

  injectPermissionsToRequest(
    request: MuvelRequest,
    novel: NovelEntity,
    permissions: BasePermission
  ) {
    request.novel = {
      ...novel,
      permissions,
    }
  }
}
