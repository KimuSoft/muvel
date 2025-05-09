// app/services/novelService.ts

import {
  type Novel as ApiNovel,
  ShareType as ApiShareType,
} from "muvel-api-types"
// 개별 함수 임포트 및 별칭 사용으로 변경
import {
  createCloudNovel,
  deleteCloudNovel,
  getCloudNovel,
  updateCloudNovel,
} from "./api/api.novel"

// 개별 함수 임포트 및 별칭 사용으로 변경
import {
  createLocalNovel as createTauriLocalNovel,
  getLocalNovelDetails as getTauriLocalNovelDetails,
  updateLocalNovelMetadata as updateTauriLocalNovelMetadata,
} from "./tauri/novelStorage"
import {
  getAllLocalNovelEntries as getAllTauriLocalNovelEntries,
  getLocalNovelEntry as getTauriLocalNovelEntry,
  registerNovelFromPath as registerTauriNovelFromPath,
  removeNovelDataAndFromIndex as removeTauriNovelDataAndFromIndex,
} from "./tauri/indexStorage"
import {
  openFileDialog as openTauriFileDialog,
  openFolderDialog as openTauriFolderDialog,
} from "./tauri/fileDialog"

import type {
  CreateLocalNovelOptions,
  LocalNovelData,
  UpdateLocalNovelData,
} from "./tauri/types"

const IS_TAURI_APP = import.meta.env.VITE_TAURI === "true"

// 소설 식별자 또는 최소 컨텍스트를 위한 타입
export interface NovelIdentifierContext {
  id: string
  share?: ApiShareType // share 타입은 선택적으로 포함될 수 있음
}
export type NovelInput = string | NovelIdentifierContext

/**
 * 새로운 소설을 생성합니다.
 */
export const createNovel = async (options: {
  title: string
  shareTypeToCreate:
    | ApiShareType.Local
    | ApiShareType.Public
    | ApiShareType.Private
    | ApiShareType.Unlisted
}): Promise<ApiNovel | LocalNovelData> => {
  const { title, shareTypeToCreate } = options

  if (shareTypeToCreate === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error("로컬 소설 생성은 Tauri 앱 환경에서만 가능합니다.")
    }
    const targetDirectoryPath = await openTauriFolderDialog(
      "새 소설을 저장할 폴더를 선택하세요",
    )
    if (!targetDirectoryPath) {
      throw new Error("소설 생성이 취소되었습니다 (저장 폴더 미선택).")
    }
    const tauriCreateOptions: CreateLocalNovelOptions = {
      title,
      targetDirectoryPath,
    }
    return createTauriLocalNovel(tauriCreateOptions)
  } else {
    return createCloudNovel({ title, share: shareTypeToCreate })
  }
}

/**
 * ID로 특정 소설의 상세 정보를 가져옵니다.
 */
export const getNovel = async (
  novelId: string,
): Promise<ApiNovel | LocalNovelData> => {
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
 * 소설 정보를 업데이트합니다.
 * novelInput은 소설 ID 문자열 또는 ID와 share 타입을 포함하는 객체입니다.
 */
export const updateNovel = async (
  novelInput: NovelInput,
  patchData: UpdateLocalNovelData,
): Promise<ApiNovel | LocalNovelData> => {
  const { id: novelId, share: shareTypeToUse } =
    await resolveNovelContext(novelInput)

  if (shareTypeToUse === ApiShareType.Local) {
    if (!IS_TAURI_APP) {
      throw new Error("로컬 소설 수정은 Tauri 앱 환경에서만 가능합니다.")
    }
    return updateTauriLocalNovelMetadata(novelId, patchData)
  } else {
    const cloudPatchData: Partial<ApiNovel> = patchData
    return updateCloudNovel({ id: novelId, ...cloudPatchData })
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
export const getMyNovels = async (): Promise<(ApiNovel | LocalNovelData)[]> => {
  let cloudNovels: ApiNovel[] = []
  const localNovels: LocalNovelData[] = []
  const combinedNovels: (ApiNovel | LocalNovelData)[] = []

  try {
    // cloudNovels = await getMyCloudNovelsApi(); // 실제 API 호출 함수로 대체 필요
    console.warn(
      "getMyCloudNovelsApi is not implemented, returning empty cloud novels for now.",
    )
  } catch (error) {
    console.error("Error fetching cloud novels:", error)
  }

  if (IS_TAURI_APP) {
    try {
      const localNovelEntries = await getAllTauriLocalNovelEntries()
      const detailedLocalNovelsPromises = localNovelEntries.map((entry) =>
        getTauriLocalNovelDetails(entry.id).catch((e) => {
          console.error(
            `Error fetching details for local novel ${entry.id}:`,
            e,
          )
          return null
        }),
      )

      const resolvedLocalNovels = await Promise.all(detailedLocalNovelsPromises)
      resolvedLocalNovels.forEach((novel) => {
        if (novel) {
          localNovels.push(novel)
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
 * 사용자가 직접 연 로컬 소설 파일(.muvl)을 앱에 등록(인덱싱)하고 해당 소설 정보를 반환합니다.
 */
export const openAndRegisterLocalNovel = async (): Promise<
  ApiNovel | LocalNovelData | null
> => {
  if (!IS_TAURI_APP) {
    throw new Error("로컬 소설 열기는 Tauri 앱 환경에서만 가능합니다.")
  }

  const filePath = await openTauriFileDialog(
    "열고 싶은 소설 파일(.muvl)을 선택하세요",
    ["muvl"],
    "Muvel 소설 파일",
  )

  if (!filePath) {
    return null
  }

  const novelId = await registerTauriNovelFromPath(filePath)
  if (!novelId) {
    throw new Error(
      `파일(${filePath})에서 소설 정보를 등록하거나 ID를 가져올 수 없습니다.`,
    )
  }

  return getNovel(novelId)
}
