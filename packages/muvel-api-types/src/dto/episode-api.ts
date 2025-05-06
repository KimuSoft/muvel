import { BasePermission, Episode } from "../core"

export type GetEpisodeResponseDto = Episode & {
  permissions: BasePermission
  novel: Episode
}
