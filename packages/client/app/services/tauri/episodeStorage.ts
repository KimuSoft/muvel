// app/services/tauri/episodeStorage.ts
import { getCoreApi } from "./tauriApiProvider"
import {
  type CreateEpisodeBodyDto,
  type DeltaBlock,
  type Episode as ApiEpisode,
  type EpisodeBlock,
  type GetEpisodeResponseDto,
  type LocalEpisode,
  masterPermission,
  type UpdateEpisodeBodyDto,
} from "muvel-api-types"
import {
  CMD_BACKUP_CLOUD_EPISODE,
  CMD_CREATE_LOCAL_EPISODE,
  CMD_DELETE_LOCAL_EPISODE,
  CMD_GET_LOCAL_EPISODE_DATA,
  CMD_LIST_LOCAL_EPISODE_SUMMARIES,
  CMD_SYNC_LOCAL_DELTA_BLOCKS,
  CMD_UPDATE_LOCAL_EPISODE_METADATA,
} from "~/services/tauri/constants"

// --- 에피소드 CRUD 관련 Rust 커맨드 이름 (예시) ---
/**
 * 새로운 로컬 에피소드 생성을 Rust에 요청합니다.
 * Rust는 .mvle 파일을 생성하고, 부모 소설의 .muvl 파일 내 에피소드 목록도 업데이트합니다.
 */
export const createLocalNovelEpisode = async (
  novelId: string,
  options: CreateEpisodeBodyDto,
): Promise<ApiEpisode> => {
  const { invoke } = await getCoreApi()
  try {
    console.log(novelId, options)
    // Rust는 새 episodeId 생성, 파일 생성, 부모 .muvl 업데이트 후 새 ApiEpisode 호환 객체 반환
    return await invoke<ApiEpisode>(CMD_CREATE_LOCAL_EPISODE, {
      novelId,
      options,
    })
  } catch (error) {
    console.error(`Error creating local episode for novel ${novelId}:`, error)
    throw error
  }
}

/**
 * 특정 로컬 에피소드의 전체 데이터(메타데이터 + 블록)를 Rust에 요청합니다.
 * @param episodeId 조회할 에피소드의 UUID
 * @returns 에피소드 데이터 (LocalEpisodeData 또는 ApiEpisode + blocks 형태)
 */
export const getLocalEpisodeById = async (episodeId: string) => {
  const { invoke } = await getCoreApi()
  try {
    const episode = await invoke<
      Omit<GetEpisodeResponseDto & LocalEpisode, "permission">
    >(CMD_GET_LOCAL_EPISODE_DATA, { episodeId })

    return {
      ...episode,
      permissions: masterPermission,
    }
  } catch (error) {
    console.error(`Error fetching local episode data for ${episodeId}:`, error)
    throw error
  }
}

/**
 * 특정 로컬 에피소드의 메타데이터 업데이트를 Rust에 요청합니다.
 * (주의: 이 작업은 실제로는 부모 소설의 .muvl 파일을 수정하게 됨)
 * @param episodeId 업데이트할 에피소드의 UUID
 * @param metadata 업데이트할 메타데이터 (UpdateLocalEpisodeMetadata 타입)
 * @returns 업데이트된 에피소드 정보 (ApiEpisode와 호환, 선택적)
 */
export const updateLocalEpisodeMetadata = async (
  episodeId: string,
  metadata: UpdateEpisodeBodyDto,
): Promise<ApiEpisode | void> => {
  const { invoke } = await getCoreApi()
  try {
    // Rust는 episodeId로 부모 novelId 찾고 -> .muvl 파일 내 해당 에피소드 정보 업데이트
    return await invoke<ApiEpisode | void>(CMD_UPDATE_LOCAL_EPISODE_METADATA, {
      episodeId,
      metadata,
    })
  } catch (error) {
    console.error(
      `Error updating local episode metadata for ${episodeId}:`,
      error,
    )
    throw error
  }
}

/**
 * 특정 로컬 에피소드 파일 삭제를 Rust에 요청합니다.
 * Rust는 .mvle 파일을 삭제하고, 부모 소설 .muvl 파일의 목록도 업데이트해야 합니다.
 * @param episodeId 삭제할 에피소드의 UUID
 */
export const deleteLocalEpisode = async (episodeId: string): Promise<void> => {
  const { invoke } = await getCoreApi()
  try {
    await invoke(CMD_DELETE_LOCAL_EPISODE, { episodeId })
  } catch (error) {
    console.error(`Error deleting local episode ${episodeId}:`, error)
    throw error
  }
}

/**
 * 특정 로컬 소설에 속한 모든 에피소드의 요약 정보 목록을 Rust에 요청합니다.
 * (소설 상세 페이지의 에피소드 목록 표시에 사용)
 * @param novelId 부모 소설의 UUID
 * @returns 에피소드 요약 정보(ID, 제목, 순서 등) 배열
 */
export const listLocalEpisodeSummaries = async (
  novelId: string,
): Promise<Array<{ id: string; title: string; order: number }>> => {
  const { invoke } = await getCoreApi()
  try {
    // Rust는 novelId로 .muvl 파일 읽어서 episodesSummary 부분 반환
    return await invoke<Array<{ id: string; title: string; order: number }>>(
      CMD_LIST_LOCAL_EPISODE_SUMMARIES,
      { novelId },
    )
  } catch (error) {
    console.error(
      `Error listing local episode summaries for novel ${novelId}:`,
      error,
    )
    return []
  }
}

export const syncLocalDeltaBlocks = async (
  episodeId: string,
  deltaBlocks: DeltaBlock[],
) => {
  const { invoke } = await getCoreApi()
  try {
    return await invoke(CMD_SYNC_LOCAL_DELTA_BLOCKS, { episodeId, deltaBlocks })
  } catch (error) {
    console.error(`Error syncing local delta blocks:`, error)
    throw error
  }
}

export const backupCloudEpisodeToLocal = async (
  fullEpisodeContext: GetEpisodeResponseDto & { blocks: EpisodeBlock[] },
) => {
  const { invoke } = await getCoreApi()
  try {
    return await invoke(CMD_BACKUP_CLOUD_EPISODE, { data: fullEpisodeContext })
  } catch (error) {
    console.error(`Error syncing local delta blocks:`, error)
    throw error
  }
}
