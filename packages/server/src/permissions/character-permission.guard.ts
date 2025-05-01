import { BadRequestException, Injectable } from "@nestjs/common"
import { BasePermissionGuard, PermissionResult } from "./base-permission.guard"
import { Reflector } from "@nestjs/core"
import { OptionalAuthenticatedRequest } from "../auth/jwt-auth.guard"
import { BasePermission } from "muvel-api-types"
import { isUuid } from "../utils/isUuid"
import { CharacterEntity } from "../characters/character.entity"
import { CharacterPermissionService } from "../characters/services/character-permission.service"

/**
 * 캐릭터 자체가 없을 경우에도 오류가 발생합니다
 * 사용 시 req.character에 에피소드 정보가 담깁니다 (novel 및 novel.author 포함)
 * */
@Injectable()
export class CharacterPermissionGuard extends BasePermissionGuard<CharacterEntity> {
  constructor(
    reflector: Reflector,
    private readonly characterPermissionService: CharacterPermissionService
  ) {
    super(reflector)
  }

  getResourceId(request: OptionalAuthenticatedRequest): string {
    return request.params.id // episodeId
  }

  async getPermission(
    characterId: string,
    userId?: string
  ): Promise<PermissionResult<CharacterEntity>> {
    if (!isUuid(characterId))
      throw new BadRequestException("Invalid episode ID")
    const character = await this.characterPermissionService.getPermission(
      characterId,
      userId
    )
    return {
      permissions: character.permissions,
      resource: character,
    }
  }

  injectPermissionsToRequest(
    request: CharacterPermissionRequest,
    character: CharacterEntity,
    permissions: BasePermission
  ) {
    request.character = {
      ...character,
      permissions,
    }
  }
}

export interface CharacterPermissionRequest
  extends OptionalAuthenticatedRequest {
  character: CharacterEntity & { permissions: BasePermission }
}
