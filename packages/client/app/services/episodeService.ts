// app/services/episodeService.ts

import {
  type Block as ApiBlock,
  type Episode as ApiEpisode,
  ShareType as ApiShareType,
} from "muvel-api-types"

// 클라우드 API 호출 함수 임포트 (경로 및 함수 이름은 실제 프로젝트에 맞게)
// Tauri 로컬 스토리지 호출 함수 임포트
import {
  createLocalEpisode as createTauriLocalEpisode,
  deleteLocalEpisode as deleteTauriLocalEpisode,
  getLocalEpisodeData as getTauriLocalEpisodeData,
  getLocalEpisodeData,
  listLocalEpisodeSummaries as listTauriLocalEpisodeSummaries,
  updateLocalEpisodeBlocks as updateTauriLocalEpisodeBlocks,
  updateLocalEpisodeMetadata as updateTauriLocalEpisodeMetadata,
} from "./tauri/episodeStorage"

// Novel 서비스 및 타입 (부모 소설 정보 확인용)
import { getNovel, type NovelInput } from "./novelService"
import type {
  CreateLocalEpisodeOptions,
  LocalEpisodeData,
  UpdateLocalEpisodeBlocksData,
  UpdateLocalEpisodeMetadata,
} from "./tauri/types"
import { createCloudNovelEpisode } from "~/services/api/api.novel"
import {
  getCloudEpisodeBlocks,
  getCloudEpisodeById,
  updateCloudEpisode,
  updateCloudEpisodeBlocks,
} from "~/services/api/api.episode"

const IS_TAURI_APP = import.meta.env.VITE_TAURI === "true"

// Helper function to get novel context (id and share type)
// novelService의 resolveNovelContext와 유사하지만, 여기서는 getNovel을 직접 사용
const getNovelShareType = async (
  novelInput: NovelInput,
): Promise<ApiShareType> => {
  if (typeof novelInput === "string") {
    const novel = await getNovel(novelInput)
    return novel.share
  }
  if (novelInput.share) {
    return novelInput.share
  }
  const novel = await getNovel(novelInput.id)
  return novel.share
}

/**
 * 새로운 에피소드를 생성합니다.
 * 부모 소설의 shareType에 따라 로컬 또는 클라우드에 생성합니다.
 */
export const createEpisode = async (
  novelInput: NovelInput, // 부모 소설 ID 또는 컨텍스트
  options: Omit<CreateLocalEpisodeOptions, "novelId">, // novelId는 novelInput에서 가져옴
): Promise<ApiEpisode | LocalEpisodeData> => {
  const parentNovelId =
    typeof novelInput === "string" ? novelInput : novelInput.id
  const shareType = await getNovelShareType(novelInput)

  if (shareType === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error("로컬 에피소드 생성은 Tauri 앱 환경에서만 가능합니다.")
    }
    const tauriCreateOptions: CreateLocalEpisodeOptions = {
      novelId: parentNovelId,
      ...options,
    }
    return createTauriLocalEpisode(tauriCreateOptions)
  } else {
    // 클라우드 에피소드 생성 (createCloudNovelEpisode는 novelId와 episodeData를 인자로 받아야 함)
    // ApiEpisode의 Partial 형태 또는 특정 DTO를 사용
    const episodeDataForCloud: Partial<
      Omit<ApiEpisode, "id" | "novelId" | "createdAt" | "updatedAt">
    > = {
      title: options.title,
      episodeType: options.episodeType,
      order: options.order,
      // description, authorComment 등 필요한 필드 추가
    }
    return createCloudNovelEpisode(parentNovelId, episodeDataForCloud)
  }
}

/**
 * ID로 특정 에피소드의 전체 데이터(블록 포함)를 가져옵니다.
 */
export const getEpisodeData = async (
  novelInput: NovelInput, // 부모 소설 ID 또는 컨텍스트
  episodeId: string,
): Promise<ApiEpisode | LocalEpisodeData> => {
  const shareType = await getNovelShareType(novelInput)

  if (shareType === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error("로컬 에피소드 조회는 Tauri 앱 환경에서만 가능합니다.")
    }
    return getTauriLocalEpisodeData(episodeId) // Rust에서 novelId 없이 episodeId만으로 찾도록 구현 가정
    // 또는 getTauriLocalEpisodeData(novelId, episodeId)
  } else {
    // getCloudEpisodeById는 GetEpisodeResponseDto를 반환할 것이고, 이는 ApiEpisode를 확장한 형태
    return getCloudEpisodeById(episodeId)
  }
}

/**
 * 에피소드의 메타데이터를 업데이트합니다.
 */
export const updateEpisode = async (
  novelInput: NovelInput, // 부모 소설 ID 또는 컨텍스트
  episodeId: string,
  metadata: UpdateLocalEpisodeMetadata, // 로컬용 메타데이터 타입 (ApiEpisode의 Partial과 유사)
): Promise<ApiEpisode | void> => {
  // 로컬은 void 또는 업데이트된 요약 정보 반환 가능
  const shareType = await getNovelShareType(novelInput)
  const parentNovelId =
    typeof novelInput === "string" ? novelInput : novelInput.id

  if (shareType === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error(
        "로컬 에피소드 메타데이터 수정은 Tauri 앱 환경에서만 가능합니다.",
      )
    }
    // updateTauriLocalEpisodeMetadata는 novelId도 필요로 할 수 있음 (Rust 구현에 따라)
    // 여기서는 episodeId만으로 처리한다고 가정. (Rust에서 부모 novelId 찾거나, .muvl 직접 수정)
    return updateTauriLocalEpisodeMetadata(episodeId, metadata)
  } else {
    const cloudMetadataPatch: Partial<ApiEpisode> = metadata
    return updateCloudEpisode(episodeId, cloudMetadataPatch)
  }
}

/**
 * 에피소드의 블록(내용)을 업데이트합니다.
 */
export const updateEpisodeBlocks = async (
  novelInput: NovelInput, // 부모 소설 ID 또는 컨텍스트
  episodeId: string,
  blocks: UpdateLocalEpisodeBlocksData, // ApiBlock[]
): Promise<ApiBlock[] | void> => {
  // 클라우드는 보통 업데이트된 블록 반환, 로컬은 void
  const shareType = await getNovelShareType(novelInput)

  if (shareType === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error(
        "로컬 에피소드 내용 수정은 Tauri 앱 환경에서만 가능합니다.",
      )
    }
    // updateTauriLocalEpisodeBlocks는 novelId도 필요로 할 수 있음 (Rust 구현에 따라)
    await updateTauriLocalEpisodeBlocks(episodeId, blocks)
    return // 로컬은 보통 void 반환
  } else {
    return updateCloudEpisodeBlocks(episodeId, blocks)
  }
}

/**
 * 에피소드를 삭제합니다.
 */
export const deleteEpisode = async (
  novelInput: NovelInput, // 부모 소설 ID 또는 컨텍스트
  episodeId: string,
): Promise<void> => {
  const shareType = await getNovelShareType(novelInput)
  const parentNovelId =
    typeof novelInput === "string" ? novelInput : novelInput.id

  if (shareType === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error("로컬 에피소드 삭제는 Tauri 앱 환경에서만 가능합니다.")
    }
    // deleteTauriLocalEpisode는 novelId도 필요로 할 수 있음 (Rust 구현에 따라)
    await deleteTauriLocalEpisode(episodeId) // Rust에서 .muvl 업데이트까지 처리
  } else {
    // await deleteCloudEpisode(episodeId); // 클라우드 API 호출 (구현 필요)
    console.warn(`Cloud episode deletion for ${episodeId} is not implemented.`)
    throw new Error("클라우드 에피소드 삭제 기능이 구현되지 않았습니다.")
  }
}

/**
 * 특정 소설의 모든 에피소드 요약 정보 목록을 가져옵니다.
 * (novelService.getNovel().episodes 와 유사한 기능을 제공 목표)
 */
export const listEpisodeSummaries = async (
  novelInput: NovelInput,
): Promise<ApiEpisode[]> => {
  // 반환 타입을 ApiEpisode 요약 정보로 통일 시도
  const shareType = await getNovelShareType(novelInput)
  const parentNovelId =
    typeof novelInput === "string" ? novelInput : novelInput.id

  if (shareType === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error(
        "로컬 에피소드 목록 조회는 Tauri 앱 환경에서만 가능합니다.",
      )
    }
    // listTauriLocalEpisodeSummaries는 LocalNovelDataEpisodesSummary[] 반환 가정
    // 이를 ApiEpisode[] (요약 형태)로 변환 필요
    const summaries = await listTauriLocalEpisodeSummaries(parentNovelId)
    return summaries.map(
      (s) =>
        ({
          id: s.id,
          title: s.title,
          order: s.order,
          // episodeType: s.episode_type, // Rust 모델 필드명과 TS 타입 필드명 일치 필요
          // contentLength: s.content_length || 0,
          // createdAt: s.created_at, // Rust 모델 필드명과 TS 타입 필드명 일치 필요
          // updatedAt: s.updated_at, // Rust 모델 필드명과 TS 타입 필드명 일치 필요
          novelId: parentNovelId,
          // ApiEpisode의 다른 필수 필드들 기본값 설정
          description: "",
          authorComment: "",
          flowDoc: null,
        }) as ApiEpisode,
    ) // 타입 단언 사용
  } else {
    // 클라우드의 경우, 보통 소설 정보를 가져올 때 에피소드 목록이 함께 옴.
    // novelService.getNovel(parentNovelId)를 호출하여 그 안의 episodes를 반환.
    const novelData = await getNovel(parentNovelId) // novelService의 getNovel 사용
    return novelData.episodes || []
  }
}

/**
 * 특정 에피소드의 블록(내용) 데이터만 가져옵니다.
 */
export const getEpisodeBlocks = async (
  novelInput: NovelInput, // 부모 소설 ID 또는 컨텍스트
  episodeId: string,
): Promise<ApiBlock[]> => {
  const shareType = await getNovelShareType(novelInput)

  if (shareType === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error(
        "로컬 에피소드 블록 조회는 Tauri 앱 환경에서만 가능합니다.",
      )
    }
    // getTauriLocalEpisodeData는 LocalEpisodeData (blocks 포함)를 반환한다고 가정
    const localEpisodeData = await getLocalEpisodeData(episodeId)
    return localEpisodeData.blocks // LocalEpisodeData에서 blocks 배열 반환
  } else {
    // 클라우드 API를 통해 특정 에피소드의 블록만 가져옴
    return getCloudEpisodeBlocks(episodeId)
  }
}
