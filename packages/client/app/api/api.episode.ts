import { api } from "~/utils/api"
import { type Block, type LegacyBlock } from "muvel-api-types"

export const getEpisodeBlocks = async (episodeId: string) => {
  const { data } = await api.get<Block[]>(`episodes/${episodeId}/blocks`)
  return data
}

export const getEpisodeLegacyBlocks = async (episodeId: string) => {
  const { data } = await api.get<LegacyBlock[]>(
    `episodes/${episodeId}/legacy-blocks`,
  )
  return data
}

export const updateEpisodeBlocks = async (
  episodeId: string,
  blocks: (
    | (Omit<Block, "text"> & { isDeleted?: boolean })
    | { id: string; isDeleted: boolean }
  )[],
) => {
  const { data } = await api.patch<Block[]>(
    `episodes/${episodeId}/blocks`,
    blocks,
  )
  return data
}
