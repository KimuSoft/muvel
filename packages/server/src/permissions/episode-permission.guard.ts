import { BadRequestException, Injectable } from "@nestjs/common"
import { BasePermissionGuard, PermissionResult } from "./base-permission.guard"
import { Reflector } from "@nestjs/core"
import { EpisodesService } from "../episodes/services/episodes.service"
import { MuvelRequest } from "../auth/jwt-auth.guard"
import { EpisodeEntity } from "../episodes/entities/episode.entity"
import { BasePermission } from "muvel-api-types"
import { isUuid } from "../utils/isUuid"

@Injectable()
export class EpisodePermissionGuard extends BasePermissionGuard<EpisodeEntity> {
  constructor(
    reflector: Reflector,
    private readonly episodesService: EpisodesService
  ) {
    super(reflector)
  }

  getResourceId(request: MuvelRequest): string {
    return request.params.id // episodeId
  }

  async getPermission(
    episodeId: string,
    userId?: string
  ): Promise<PermissionResult<EpisodeEntity>> {
    if (!isUuid(episodeId)) throw new BadRequestException("Invalid episode ID")
    const { episode, permissions } =
      await this.episodesService.getEpisodePermission(episodeId, userId)
    return {
      permissions,
      resource: episode,
    }
  }

  injectPermissionsToRequest(
    request: MuvelRequest,
    episode: EpisodeEntity,
    permissions: BasePermission
  ) {
    request.episode = {
      ...episode,
      permissions,
    }
  }
}
