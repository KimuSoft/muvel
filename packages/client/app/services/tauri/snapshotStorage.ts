import { getCoreApi } from "~/services/tauri/tauriApiProvider"
import {
  CMD_CREATE_LOCAL_EPISODE_SNAPSHOT,
  CMD_GET_LOCAL_EPISODE_SNAPSHOT,
} from "~/services/tauri/constants"
import type { EpisodeSnapshot, SnapshotReason } from "muvel-api-types"

/**
 * 로컬 에피소드의 스냅샷을 생성합니다.
 * @param episodeId
 */
export const createLocalEpisodeSnapshot = async (
  episodeId: string,
  reason: SnapshotReason,
): Promise<void> => {
  const { invoke } = await getCoreApi()
  try {
    await invoke(CMD_CREATE_LOCAL_EPISODE_SNAPSHOT, { episodeId, reason })
  } catch (error) {
    console.error(`Error creating local episode snapshot ${episodeId}:`, error)
    throw error
  }
}

/**
 * 특정 로컬 에피소드의 스냅샷을 모두 불러옵니다.
 * @param episodeId
 */
export const getLocalEpisodeSnapshots = async (
  episodeId: string,
): Promise<EpisodeSnapshot[]> => {
  const { invoke } = await getCoreApi()
  try {
    return await invoke<EpisodeSnapshot[]>(CMD_GET_LOCAL_EPISODE_SNAPSHOT, {
      episodeId,
    })
  } catch (error) {
    console.error(`Error fetching local episode snapshots ${episodeId}:`, error)
    throw error
  }
}
