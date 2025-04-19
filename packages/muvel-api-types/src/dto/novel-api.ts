import { BasePermission, Block, Episode, Novel } from "../core"

export type GetNovelResponseDto = Novel & {
  permissions: BasePermission
  episodes: Episode[]
}

export type ExportNovelResponseDto = Novel & {
  episodes: (Episode & { blocks: Block[] })[]
}
