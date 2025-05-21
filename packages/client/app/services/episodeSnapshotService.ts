import {
  type EpisodeInput,
  resolveEpisodeContext,
} from "~/services/episodeService"
import { saveCloudSnapshot } from "~/services/api/api.episode-snapshot"
import {
  type EpisodeSnapshot,
  ShareType,
  type SnapshotReason,
} from "muvel-api-types"

export const saveEpisodeSnapshot = async (
  episodeInput: EpisodeInput,
  reason: SnapshotReason,
): Promise<EpisodeSnapshot | null> => {
  const { episodeId, novelShareType } =
    await resolveEpisodeContext(episodeInput)

  if (novelShareType === ShareType.Local) {
    console.warn("로컬 스냅샷 저장은 지원하지 않습니다.")
    return null
  } else {
    return saveCloudSnapshot(episodeId, reason)
  }
}
