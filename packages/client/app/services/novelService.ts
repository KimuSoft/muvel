// app/services/novelService.ts

import {
  type CreateNovelRequestDto,
  type CreateWikiPageRequestBody,
  type ExportNovelResponseDto,
  type GetNovelResponseDto,
  type Novel as ApiNovel,
  ShareType,
  ShareType as ApiShareType,
  type UpdateNovelRequestDto,
  type WikiPage,
} from "muvel-api-types"
// 개별 함수 임포트 및 별칭 사용으로 변경
import {
  createCloudNovel,
  createCloudNovelWikiPage,
  deleteCloudNovel,
  exportCloudNovel,
  getCloudNovel,
  updateCloudNovel,
  updateCloudNovelEpisodes,
} from "./api/api.novel"

// 개별 함수 임포트 및 별칭 사용으로 변경
import {
  createLocalNovel as createTauriLocalNovel,
  getLocalNovelDetails as getTauriLocalNovelDetails,
  getMyLocalNovels,
  updateLocalNovelEpisodes,
  updateLocalNovelMetadata as updateTauriLocalNovelMetadata,
} from "./tauri/novelStorage"
import {
  deleteLocalNovel as removeTauriNovelDataAndFromIndex,
  getLocalNovelEntry as getTauriLocalNovelEntry,
} from "./tauri/indexStorage"
import { openFolderDialog as openTauriFolderDialog } from "./tauri/fileDialog"

import type {
  CreateLocalNovelOptions,
  GetLocalNovelDetailsResponse,
  LocalEpisodeData,
  LocalNovelData,
} from "./tauri/types"
import { getUserCloudNovels } from "~/services/api/api.user"
import { checkIsMobileView } from "~/hooks/usePlatform"
import { isAxiosError } from "axios"
import { toaster } from "~/components/ui/toaster"
import * as localWikiStorage from "~/services/tauri/wikiPageStorage"
import { type LocalWikiPageData } from "~/services/tauri/wikiPageStorage"

const IS_TAURI_APP = import.meta.env.VITE_TAURI === "true"

// 소설 식별자 또는 최소 컨텍스트를 위한 타입
export interface NovelIdentifierContext {
  id: string
  share?: ApiShareType // share 타입은 선택적으로 포함될 수 있음
}
export type NovelInput = string | NovelIdentifierContext

const isMobile = checkIsMobileView()

// Helper function to get share type and id from NovelInput
const resolveNovelContext = async (
  input: NovelInput,
): Promise<{ id: string; share: ApiShareType }> => {
  if (typeof input === "string") {
    const novel = await getNovel(input) // ID만 있으면 getNovel을 통해 share 타입 확인
    return { id: novel.id, share: novel.share }
  }
  // NovelIdentifierContext 객체에 share가 있으면 사용, 없으면 getNovel 호출
  if (input.share) {
    return { id: input.id, share: input.share }
  }
  const novel = await getNovel(input.id)
  return { id: novel.id, share: novel.share }
}

/**
 * 새로운 소설을 생성합니다.
 */
export const createNovel = async (
  options: CreateNovelRequestDto,
): Promise<ApiNovel | LocalNovelData> => {
  const { title, share } = options

  if (share === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error("로컬 소설 생성은 Tauri 앱 환경에서만 가능합니다.")
    }
    let targetDirectoryPath: string | null = null

    if (!isMobile) {
      targetDirectoryPath = await openTauriFolderDialog("소설 프로젝트 생성")
      if (!targetDirectoryPath) {
        throw new Error("소설 생성이 취소되었습니다 (저장 폴더 미선택).")
      }
    }
    const tauriCreateOptions: CreateLocalNovelOptions = {
      title,
      targetDirectoryPath,
    }
    return createTauriLocalNovel(tauriCreateOptions)
  } else {
    return createCloudNovel({ title, share: share })
  }
}

/**
 * ID로 특정 소설의 상세 정보를 가져옵니다.
 */
export const getNovel = async (
  novelId: string,
): Promise<GetNovelResponseDto | GetLocalNovelDetailsResponse> => {
  if (IS_TAURI_APP) {
    const localNovelEntry = await getTauriLocalNovelEntry(novelId)
    if (localNovelEntry) {
      try {
        return await getTauriLocalNovelDetails(novelId)
      } catch (localError) {
        console.warn(
          `로컬 소설(ID: ${novelId}) 로드 실패. 클라우드 시도:`,
          localError,
        )
      }
    }
  }

  try {
    return await getCloudNovel(novelId)
  } catch (cloudError) {
    if (IS_TAURI_APP) {
      console.error(
        `Tauri: 로컬 및 클라우드 모두에서 소설(ID: ${novelId})을 찾을 수 없습니다.`,
        cloudError,
      )
      throw new Error(
        `소설(ID: ${novelId})을 로컬 또는 클라우드에서 찾을 수 없습니다.`,
      )
    }
    throw cloudError
  }
}

/**
 * 소설 정보를 업데이트합니다.
 * novelInput은 소설 ID 문자열 또는 ID와 share 타입을 포함하는 객체입니다.
 */
export const updateNovel = async (
  novelInput: NovelInput,
  patchData: UpdateNovelRequestDto,
): Promise<ApiNovel | LocalNovelData> => {
  const { id: novelId, share: shareTypeToUse } =
    await resolveNovelContext(novelInput)

  if (shareTypeToUse === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error("로컬 소설 수정은 Tauri 앱 환경에서만 가능합니다.")
    }
    return updateTauriLocalNovelMetadata(novelId, patchData)
  } else {
    return updateCloudNovel(novelId, patchData)
  }
}

/**
 * 소설을 삭제합니다.
 * novelInput은 소설 ID 문자열 또는 ID와 share 타입을 포함하는 객체입니다.
 */
export const deleteNovel = async (novelInput: NovelInput): Promise<void> => {
  const { id: novelId, share: shareTypeToUse } =
    await resolveNovelContext(novelInput)

  if (shareTypeToUse === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error("로컬 소설 삭제는 Tauri 앱 환경에서만 가능합니다.")
    }
    await removeTauriNovelDataAndFromIndex(novelId)
  } else {
    await deleteCloudNovel(novelId)
  }
}

/**
 * 사용자의 모든 소설 목록을 가져옵니다 (로컬 + 클라우드 조합).
 */
export const getMyNovels = async (
  myId?: string,
): Promise<(ApiNovel | LocalNovelData)[]> => {
  let cloudNovels: ApiNovel[] = []
  let localNovels: LocalNovelData[] = []
  const combinedNovels: (ApiNovel | LocalNovelData)[] = []

  try {
    // 오프라인이거나 로그인 안 했을 때는 클라우드 소설을 가져오지 않음
    if (navigator.onLine && myId) {
      cloudNovels = await getUserCloudNovels(myId)
    }
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 426) {
      toaster.error({
        title: "앱 버전이 너무 낮습니다.",
        description:
          "더 이상 뮤블 클라우드가 지원되지 않는 버전입니다. 앱을 업데이트 해주세요.",
      })
    }
    console.error("Error fetching cloud novels:", error)
  }

  if (IS_TAURI_APP) {
    console.log('"Fetching local novels..."')
    try {
      localNovels = await getMyLocalNovels()
      // 나중에 로컬에 저장된 클라우드 소설을 구분하기 위해 만들어 둠
      localNovels.forEach((ln) => {
        if (ln.share === ApiShareType.Local) {
          localNovels.push(ln)
        }
      })
    } catch (error) {
      console.error("Error fetching local novels:", error)
    }
  }

  combinedNovels.push(...localNovels)

  cloudNovels.forEach((cn) => {
    if (!combinedNovels.find((ln) => ln.id === cn.id)) {
      combinedNovels.push(cn)
    }
  })

  combinedNovels.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )

  return combinedNovels
}

/**
 * 특정 소설에 속한 여러 에피소드들의 정보를 일괄 업데이트합니다. (주로 순서 변경 등)
 * @param novelInput 업데이트할 에피소드들이 속한 소설의 ID 또는 컨텍스트
 * @param episodeDiffs 변경할 에피소드 정보 배열. 각 객체는 id와 변경할 필드를 포함합니다.
 * @returns 업데이트된 에피소드 정보 배열 (클라우드 API의 반환값 따름)
 */
export const updateNovelEpisodes = async (
  novelInput: NovelInput,
  episodeDiffs: ({ id: string } & Partial<LocalEpisodeData>)[],
): Promise<Omit<LocalEpisodeData, "blocks">[]> => {
  const { id: novelId, share: shareTypeToUse } =
    await resolveNovelContext(novelInput)

  if (shareTypeToUse === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error(
        "로컬 소설의 에피소드 정보 수정은 Tauri 앱 환경에서만 가능합니다.",
      )
    }

    return updateLocalNovelEpisodes(novelId, episodeDiffs)
  } else {
    return updateCloudNovelEpisodes(novelId, episodeDiffs)
  }
}

export const exportNovel = async (
  novelInput: NovelInput,
): Promise<ExportNovelResponseDto> => {
  const { id: novelId, share: shareTypeToUse } =
    await resolveNovelContext(novelInput)

  if (IS_TAURI_APP && shareTypeToUse === ShareType.Local) {
    // TODO: 로컬 소설 내보내기 기능 구현 필요 (예: tauri/ioService.ts)
    // 현재는 미구현으로 에러 처리
    throw new Error("로컬 소설 내보내기 기능은 아직 구현되지 않았습니다.")
  }
  // 클라우드 소설 내보내기
  return exportCloudNovel(novelId)
}

export const createNovelWikiPage = async (
  novelInput: NovelInput,
  options: CreateWikiPageRequestBody,
): Promise<WikiPage | LocalWikiPageData> => {
  const { id: novelId, share: shareTypeToUse } =
    await resolveNovelContext(novelInput)

  if (IS_TAURI_APP && shareTypeToUse === ShareType.Local) {
    return localWikiStorage.createLocalWikiPage(options)
  }
  return createCloudNovelWikiPage(novelId, options)
}
