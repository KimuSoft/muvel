import { BadRequestException, Injectable } from "@nestjs/common"
import { BasePermissionGuard, PermissionResult } from "./base-permission.guard"
import { Reflector } from "@nestjs/core"
import { OptionalAuthenticatedRequest } from "../auth/jwt-auth.guard"
import { EpisodeEntity } from "../episodes/entities/episode.entity"
import { BasePermission } from "muvel-api-types"
import { isUuid } from "../utils/isUuid"
import { EpisodePermissionService } from "../episodes/services/episode-permission.service"

/**
 * 에피소드 자체가 없을 경우에도 오류가 발생합니다
 * 사용 시 req.episode에 에피소드 정보가 담깁니다 (novel 및 novel.author 포함)
 * */
@Injectable()
export class EpisodePermissionGuard extends BasePermissionGuard<EpisodeEntity> {
  constructor(
    reflector: Reflector,
    private readonly episodePermissionService: EpisodePermissionService,
  ) {
    super(reflector)
  }

  getResourceId(request: OptionalAuthenticatedRequest): string {
    return request.params.id // episodeId
  }

  async getPermission(
    episodeId: string,
    userId?: string,
  ): Promise<PermissionResult<EpisodeEntity>> {
    if (!isUuid(episodeId)) throw new BadRequestException("Invalid episode ID")
    const { episode, permissions } =
      await this.episodePermissionService.getPermissions(episodeId, userId)
    return {
      permissions,
      resource: episode,
    }
  }

  injectPermissionsToRequest(
    request: EpisodePermissionRequest,
    episode: EpisodeEntity,
    permissions: BasePermission,
  ) {
    request.episode = {
      ...episode,
      permissions,
    }
  }
}

export interface EpisodePermissionRequest extends OptionalAuthenticatedRequest {
  episode: EpisodeEntity & { permissions: BasePermission }
}
