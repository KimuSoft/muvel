import { type EpisodeSnapshot, SnapshotReason } from "muvel-api-types"
import { api } from "~/utils/api"

export const getCloudSnapshots = async (episodeId: string) => {
  const { data } = await api.get<EpisodeSnapshot[]>(
    `episodes/${episodeId}/snapshots`,
  )
  return data
}

export const saveCloudSnapshot = async (
  episodeId: string,
  reason: SnapshotReason = SnapshotReason.Manual,
) => {
  const { data } = await api.post(`/episodes/${episodeId}/snapshots`, {
    reason,
  })
  return data
}
