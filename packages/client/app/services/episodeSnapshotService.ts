import {
  type EpisodeInput,
  resolveEpisodeContext,
} from "~/services/episodeService"
import {
  getCloudEpisodeSnapshots,
  saveCloudSnapshot,
} from "~/services/api/api.episode-snapshot"
import {
  type EpisodeSnapshot,
  ShareType,
  type SnapshotReason,
} from "muvel-api-types"
import {
  createLocalEpisodeSnapshot,
  getLocalEpisodeSnapshots,
} from "~/services/tauri/snapshotStorage"

export const saveEpisodeSnapshot = async (
  episodeInput: EpisodeInput,
  reason: SnapshotReason,
): Promise<EpisodeSnapshot | null> => {
  const { episodeId, novelShareType } =
    await resolveEpisodeContext(episodeInput)

  if (novelShareType === ShareType.Local) {
    await createLocalEpisodeSnapshot(episodeId, reason)
    return null
  } else {
    return saveCloudSnapshot(episodeId, reason)
  }
}

export const getEpisodeSnapshots = async (
  episodeInput: EpisodeInput,
): Promise<EpisodeSnapshot[]> => {
  const { episodeId, novelShareType } =
    await resolveEpisodeContext(episodeInput)

  if (novelShareType === ShareType.Local) {
    return getLocalEpisodeSnapshots(episodeId)
  } else {
    return getCloudEpisodeSnapshots(episodeId)
  }
}
