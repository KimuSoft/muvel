import { BasePermission, Episode, Novel } from "../core"

export type GetEpisodeResponseDto = Episode & {
  permissions: BasePermission
  novel: Novel
}
