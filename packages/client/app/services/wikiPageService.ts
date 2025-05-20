// services/wikiPageService.ts
import {
  type DeltaBlock,
  type PartialWikiBlock,
  ShareType,
  type UpdateWikiPageRequestBody,
  WikiBlockType,
  type WikiPage,
} from "muvel-api-types"
import * as cloudWikiApi from "./api/api.wiki"
import * as localWikiStorage from "./tauri/wikiPageStorage"
import { getNovel } from "./novelService"
import type { LocalNovelData } from "~/services/tauri/types"

const IS_TAURI_APP = import.meta.env.VITE_TAURI === "true"

// 위키 페이지 식별자 (ID와 소설의 shareType을 함께 관리)
export interface WikiPageInput {
  id: string
  novelId: string // 위키페이지가 속한 소설 ID
  novelShareType?: ShareType // 소설의 shareType, 로컬/클라우드 구분용
}

async function resolveWikiPageNovelShareType(
  novelId: string,
  explicitShareType?: ShareType,
): Promise<ShareType> {
  if (explicitShareType) return explicitShareType
  if (IS_TAURI_APP) {
    try {
      const novel = (await getNovel(novelId)) as
        | LocalNovelData
        | { share: ShareType } // getNovel의 반환 타입에 따라 조정
      return novel.share || ShareType.Private // 로컬 우선 조회 후 share 타입 반환
    } catch (e) {
      // 로컬 조회 실패 시 클라우드로 간주 (또는 에러 처리)
      console.warn(
        `Failed to get novel ${novelId} to determine share type for wiki page, assuming cloud.`,
        e,
      )
      return ShareType.Private
    }
  }
  return ShareType.Private // Tauri가 아니면 클라우드로 가정
}

export const getWikiPageById = async (
  wikiPageInput: WikiPageInput,
): Promise<WikiPage | localWikiStorage.LocalWikiPageData> => {
  const novelShareType = await resolveWikiPageNovelShareType(
    wikiPageInput.novelId,
    wikiPageInput.novelShareType,
  )

  if (IS_TAURI_APP && novelShareType === ShareType.Local) {
    return localWikiStorage.getLocalWikiPage(wikiPageInput.id)
  }
  return cloudWikiApi.getCloudWikiPageById(wikiPageInput.id)
}

export const updateWikiPageMetadata = async (
  wikiPageInput: WikiPageInput,
  metadata: UpdateWikiPageRequestBody, // API DTO 사용
): Promise<WikiPage | localWikiStorage.LocalWikiPageData> => {
  const novelShareType = await resolveWikiPageNovelShareType(
    wikiPageInput.novelId,
    wikiPageInput.novelShareType,
  )

  if (IS_TAURI_APP && novelShareType === ShareType.Local) {
    // UpdateWikiPageDto를 localWikiStorage.UpdateLocalWikiPageOptions로 변환 필요
    const localMetadata: localWikiStorage.UpdateLocalWikiPageOptions = {
      title: metadata.title,
      // 다른 필드 매핑
    }
    return localWikiStorage.updateLocalWikiPageMetadata(
      wikiPageInput.id,
      localMetadata,
    )
  }
  return cloudWikiApi.updateCloudWikiPage(wikiPageInput.id, metadata)
}

export const deleteWikiPage = async (
  wikiPageInput: WikiPageInput,
): Promise<void> => {
  const novelShareType = await resolveWikiPageNovelShareType(
    wikiPageInput.novelId,
    wikiPageInput.novelShareType,
  )

  if (IS_TAURI_APP && novelShareType === ShareType.Local) {
    return localWikiStorage.deleteLocalWikiPage(wikiPageInput.id)
  }
  return cloudWikiApi.deleteCloudWikiPage(wikiPageInput.id)
}

export const getWikiPageBlocks = async (
  wikiPageInput: WikiPageInput,
): Promise<PartialWikiBlock[]> => {
  const novelShareType = await resolveWikiPageNovelShareType(
    wikiPageInput.novelId,
    wikiPageInput.novelShareType,
  )

  if (IS_TAURI_APP && novelShareType === ShareType.Local) {
    return localWikiStorage.getLocalWikiPageBlocks(wikiPageInput.id)
  }
  return await cloudWikiApi.getCloudWikiPageBlocks(wikiPageInput.id)
}

export const syncWikiPageBlocks = async (
  wikiPageInput: WikiPageInput,
  deltaBlocks: DeltaBlock<WikiBlockType>[],
): Promise<void> => {
  const novelShareType = await resolveWikiPageNovelShareType(
    wikiPageInput.novelId,
    wikiPageInput.novelShareType,
  )

  if (IS_TAURI_APP && novelShareType === ShareType.Local) {
    return localWikiStorage.syncLocalWikiPageBlocks(
      wikiPageInput.id,
      deltaBlocks,
    )
  }
  await cloudWikiApi.syncCloudWikiPageBlocks(wikiPageInput.id, deltaBlocks)
  return
}
