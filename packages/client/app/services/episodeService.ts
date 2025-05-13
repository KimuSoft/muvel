// app/services/episodeService.ts

import {
  type Block as ApiBlock,
  type BlockChange,
  type CreateEpisodeBodyDto,
  type DeltaBlock,
  type Episode as ApiEpisode,
  type GetEpisodeResponseDto,
  ShareType as ApiShareType,
  type UpdateEpisodeBodyDto,
} from "muvel-api-types"

// 클라우드 API 호출 함수 임포트
import {
  deleteCloudEpisode,
  getCloudEpisodeBlocks,
  getCloudEpisodeById,
  syncCloudDeltaBlocks,
  updateCloudEpisode,
  updateCloudEpisodeBlocks,
} from "./api/api.episode" // 경로 및 함수 이름은 실제 프로젝트에 맞게
import { createCloudNovelEpisode } from "./api/api.novel"

// Tauri 로컬 스토리지 호출 함수 임포트
import {
  createLocalNovelEpisode as createTauriLocalEpisode,
  deleteLocalEpisode as deleteTauriLocalEpisode,
  getLocalEpisodeById,
  listLocalEpisodeSummaries as listTauriLocalEpisodeSummaries,
  syncLocalDeltaBlocks,
  updateLocalEpisodeBlocks as updateTauriLocalEpisodeBlocks,
  updateLocalEpisodeMetadata as updateTauriLocalEpisodeMetadata,
} from "./tauri/episodeStorage"

// Novel 서비스 및 타입 (부모 소설 정보 확인용)
import { getNovel, type NovelInput } from "./novelService" // getNovel은 NovelInput을 처리할 수 있어야 함
import type { LocalEpisodeData } from "./tauri/types"

const IS_TAURI_APP = import.meta.env.VITE_TAURI === "true"

// --- EpisodeInput 및 컨텍스트 해결 헬퍼 ---

/**
 * 에피소드 함수에 전달될 컨텍스트 객체의 최소 형태입니다.
 * GetEpisodeResponseDto와 호환되도록 novel 필드를 가집니다.
 */
export interface EpisodeContext {
  id: string // 에피소드 ID
  novel: {
    // 부모 소설의 최소 컨텍스트
    id: string
    share: ApiShareType
    // title?: string; // 필요시 추가
  }
  // LocalEpisodeData 또는 ApiEpisode의 다른 필드들이 올 수 있음
  // 예: title, order 등 (diff 생성 시 활용 가능)
}

/**
 * 에피소드 관련 서비스 함수에 전달될 수 있는 입력 타입입니다.
 * 에피소드 ID 문자열 또는 EpisodeContext 객체입니다.
 */
export type EpisodeInput = string | EpisodeContext

interface ResolvedEpisodeContext {
  episodeId: string
  novelId: string
  novelShareType: ApiShareType
}

/**
 * EpisodeInput을 받아 episodeId, novelId, novelShareType을 반환합니다.
 * input이 문자열(episodeId)이면, getEpisodeData를 호출하여 novel 컨텍스트를 얻습니다.
 */
const resolveEpisodeContext = async (
  input: EpisodeInput,
): Promise<ResolvedEpisodeContext> => {
  if (typeof input === "string") {
    console.warn(
      '"resolveEpisodeContext" called with episodeId string. It may affect performance.',
    )

    // episodeId만 주어진 경우, getEpisodeData를 호출하여 novel 정보를 가져옵니다.
    // getEpisodeData는 novel 필드를 포함한 객체를 반환해야 합니다.
    console.time("getEpisodeData")
    const episodeData = await getEpisodeById(input)
    console.timeEnd("getEpisodeData")
    if (!episodeData.novel) {
      throw new Error(
        `Episode (ID: ${input}) data does not contain novel context.`,
      )
    }
    return {
      episodeId: episodeData.id,
      novelId: episodeData.novel.id,
      novelShareType: episodeData.novel.share,
    }
  }
  // EpisodeContext 객체가 주어진 경우
  return {
    episodeId: input.id,
    novelId: input.novel.id,
    novelShareType: input.novel.share,
  }
}

// --- 서비스 함수들 ---

/**
 * 새로운 에피소드를 생성합니다.
 * 부모 소설의 shareType에 따라 로컬 또는 클라우드에 생성합니다.
 * 이 함수는 부모 소설의 컨텍스트(NovelInput)를 명시적으로 받습니다.
 */
export const createNovelEpisode = async (
  novelInput: NovelInput, // 부모 소설 ID 또는 컨텍스트
  options: CreateEpisodeBodyDto,
): Promise<ApiEpisode | LocalEpisodeData> => {
  const parentNovelId =
    typeof novelInput === "string" ? novelInput : novelInput.id
  // create 시점에는 부모 소설의 shareType을 알아야 함
  const parentNovel = await getNovel(parentNovelId) // novelService.getNovel 사용
  const shareType = parentNovel.share

  if (shareType === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error("로컬 에피소드 생성은 Tauri 앱 환경에서만 가능합니다.")
    }

    return createTauriLocalEpisode(parentNovelId, options)
  } else {
    return createCloudNovelEpisode(parentNovelId, options)
  }
}

/**
 * ID로 특정 에피소드의 전체 데이터(블록 포함 및 novel 컨텍스트 포함)를 가져옵니다.
 * 이 함수는 EpisodeInput 대신 episodeId만 받도록 유지하여, resolveEpisodeContext 내부에서 사용될 수 있도록 합니다.
 * 반환 객체는 novel: { id, share } 필드를 반드시 포함해야 합니다.
 */
export const getEpisodeById = async (
  episodeId: string,
): Promise<GetEpisodeResponseDto> => {
  if (IS_TAURI_APP) {
    try {
      return await getLocalEpisodeById(episodeId)
    } catch (e) {
      // TODO: 커스텀 에러 필요
      return getCloudEpisodeById(episodeId)
    }
  }

  return getCloudEpisodeById(episodeId)
}

/**
 * 에피소드의 메타데이터를 업데이트합니다.
 */
export const updateEpisodeMetadata = async (
  episodeInput: EpisodeInput,
  metadata: UpdateEpisodeBodyDto,
): Promise<ApiEpisode | void> => {
  const { episodeId, novelId, novelShareType } =
    await resolveEpisodeContext(episodeInput)

  if (novelShareType === ApiShareType.Local) {
    if (!IS_TAURI_APP)
      throw new Error(
        "로컬 에피소드 메타데이터 수정은 Tauri 앱 환경에서만 가능합니다.",
      )
    // updateTauriLocalEpisodeMetadata는 novelId도 인자로 받도록 수정 (Rust 커맨드에 따라)
    return updateTauriLocalEpisodeMetadata(episodeId, metadata) // 또는 updateTauriLocalEpisodeMetadata(novelId, episodeId, metadata)
  } else {
    const cloudMetadataPatch: Partial<ApiEpisode> = metadata
    return updateCloudEpisode(episodeId, cloudMetadataPatch)
  }
}

/**
 * 에피소드의 블록(내용)을 업데이트합니다.
 */
export const updateEpisodeBlocks = async (
  episodeInput: EpisodeInput,
  blockChanges: BlockChange[],
): Promise<ApiBlock[] | void> => {
  const { episodeId, novelId, novelShareType } =
    await resolveEpisodeContext(episodeInput)

  if (novelShareType === ApiShareType.Local) {
    if (!IS_TAURI_APP)
      throw new Error(
        "로컬 에피소드 내용 수정은 Tauri 앱 환경에서만 가능합니다.",
      )
    // updateTauriLocalEpisodeBlocks는 novelId도 인자로 받도록 수정 (Rust 커맨드에 따라)
    await updateTauriLocalEpisodeBlocks(episodeId, blockChanges) // 또는 updateTauriLocalEpisodeBlocks(novelId, episodeId, blocks)
    return
  } else {
    return updateCloudEpisodeBlocks(episodeId, blockChanges)
  }
}

/**
 * 에피소드를 삭제합니다.
 */
export const deleteEpisode = async (
  episodeInput: EpisodeInput,
): Promise<void> => {
  const { episodeId, novelId, novelShareType } =
    await resolveEpisodeContext(episodeInput)

  if (novelShareType === ApiShareType.Local) {
    if (!IS_TAURI_APP)
      throw new Error("로컬 에피소드 삭제는 Tauri 앱 환경에서만 가능합니다.")
    // deleteTauriLocalEpisode는 novelId도 인자로 받도록 수정 (Rust 커맨드에 따라)
    await deleteTauriLocalEpisode(episodeId) // 또는 deleteTauriLocalEpisode(novelId, episodeId)
  } else {
    await deleteCloudEpisode(episodeId)
  }
}

/**
 * 특정 에피소드의 블록(내용) 데이터만 가져옵니다.
 */
export const getEpisodeBlocks = async (
  episodeInput: EpisodeInput,
): Promise<ApiBlock[]> => {
  const { episodeId, novelId, novelShareType } =
    await resolveEpisodeContext(episodeInput)

  if (novelShareType === ApiShareType.Local) {
    if (!IS_TAURI_APP)
      throw new Error(
        "로컬 에피소드 블록 조회는 Tauri 앱 환경에서만 가능합니다.",
      )
    const localEpisodeData = await getLocalEpisodeById(episodeId) // novelId 필요시 전달
    return localEpisodeData.blocks
  } else {
    return getCloudEpisodeBlocks(episodeId)
  }
}

/**
 * 특정 소설의 모든 에피소드 요약 정보 목록을 가져옵니다.
 * 이 함수는 부모 소설의 컨텍스트(NovelInput)를 명시적으로 받습니다.
 */
export const listEpisodeSummaries = async (
  novelInput: NovelInput, // 부모 소설 ID 또는 컨텍스트
): Promise<ApiEpisode[]> => {
  const parentNovelId =
    typeof novelInput === "string" ? novelInput : novelInput.id
  const parentNovel = await getNovel(parentNovelId) // novelService.getNovel 사용
  const shareType = parentNovel.share

  if (shareType === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error(
        "로컬 에피소드 목록 조회는 Tauri 앱 환경에서만 가능합니다.",
      )
    }
    // listTauriLocalEpisodeSummaries는 novelId를 인자로 받고,
    // LocalNovelDataEpisodesSummary[] (models.rs에 정의된)를 반환한다고 가정
    const summariesFromRust =
      await listTauriLocalEpisodeSummaries(parentNovelId)
    return summariesFromRust.map(
      (s) =>
        ({
          id: s.id,
          title: s.title,
          order: s.order,
          // episodeType: s.episode_type,
          // contentLength: s.content_length || 0,
          // createdAt: s.created_at,
          // updatedAt: s.updated_at,
          novelId: parentNovelId,
          description: "", // 요약 정보이므로 기본값 또는 Rust에서 제공
          authorComment: "", // 요약 정보이므로 기본값 또는 Rust에서 제공
          flowDoc: null, // 요약 정보이므로 null
        }) as ApiEpisode, // ApiEpisode 타입으로 변환
    )
  } else {
    // 클라우드의 경우, getNovel을 통해 받은 novel 객체 내의 episodes 사용
    return parentNovel.episodes || []
  }
}

export const syncDeltaBlocks = async (
  episodeInput: EpisodeInput,
  deltaBlocks: DeltaBlock[] = [],
): Promise<void> => {
  const { episodeId, novelId, novelShareType } =
    await resolveEpisodeContext(episodeInput)

  if (novelShareType === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error(
        "로컬 에피소드 블록 동기화는 Tauri 앱 환경에서만 가능합니다.",
      )
    }

    await syncLocalDeltaBlocks(episodeId, deltaBlocks)
    return
  } else {
    return syncCloudDeltaBlocks(episodeId, deltaBlocks)
  }
}
