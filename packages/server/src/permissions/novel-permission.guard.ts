import { BadRequestException, Injectable } from "@nestjs/common"
import { BasePermissionGuard } from "./base-permission.guard"
import { Reflector } from "@nestjs/core"
import { NovelsService } from "../novels/services/novels.service"
import { OptionalAuthenticatedRequest } from "../auth/jwt-auth.guard"
import { NovelEntity } from "../novels/novel.entity"
import { BasePermission } from "muvel-api-types"
import { isUuid } from "../utils/isUuid"
import { NovelPermissionService } from "../novels/services/novel-permission.service"

/**
 * 소설 자체가 없을 경우에도 오류가 발생합니다
 * 사용 시 req.novel에 에피소드 정보가 담깁니다 (author 포함)
 * */
@Injectable()
export class NovelPermissionGuard extends BasePermissionGuard<NovelEntity> {
  constructor(
    reflector: Reflector,
    private readonly novelPermissionService: NovelPermissionService,
  ) {
    super(reflector)
  }

  getResourceId(request: OptionalAuthenticatedRequest): string {
    return request.params.id
  }

  async getPermission(novelId: string, userId?: string) {
    if (!isUuid(novelId)) throw new BadRequestException("Invalid novel ID")
    const { novel, permissions } =
      await this.novelPermissionService.getPermissions(novelId, userId)
    return { resource: novel, permissions }
  }

  injectPermissionsToRequest(
    request: NovelPermissionRequest,
    novel: NovelEntity,
    permissions: BasePermission,
  ) {
    request.novel = {
      ...novel,
      permissions,
    }
  }
}

export interface NovelPermissionRequest extends OptionalAuthenticatedRequest {
  novel: NovelEntity & { permissions: BasePermission }
}
