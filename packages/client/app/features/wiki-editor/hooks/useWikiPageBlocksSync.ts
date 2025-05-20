import {
  type DeltaBlock,
  type GetWikiPageResponse,
  type PartialWikiBlock,
  type WikiBlock,
  type WikiBlockType,
} from "muvel-api-types" // 실제 경로에 맞게 수정
import { Node as PMNode } from "prosemirror-model"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import { useInternalBlocksSyncLogic } from "~/hooks/useInternalBlocksSyncLogic"
import { getCloudWikiPageBlocks } from "~/services/api/api.wiki" // SyncState 임포트

// 위키 페이지 블록을 가져오는 서비스 함수 (플레이스홀더)
// 실제 구현에서는 wikiPageService.ts 등에 정의되어야 합니다.
async function getWikiPageBlocks(
  context: GetWikiPageResponse,
): Promise<PartialWikiBlock[]> {
  return getCloudWikiPageBlocks(context.id)
}

// 위키 페이지 델타 블록을 동기화하는 서비스 함수 (플레이스홀더)
// 실제 구현에서는 wikiPageService.ts 등에 정의되어야 합니다.
async function syncWikiPageDeltaBlocks(
  context: GetWikiPageResponse,
  deltas: DeltaBlock<WikiBlockType>[],
): Promise<void | PartialWikiBlock[]> {
  console.warn(
    `syncWikiPageDeltaBlocks for ${context.id} is not implemented. Simulating success.`,
    deltas,
  )
  // 실제 API 호출 로직:
  // await api.patch(`/wiki-pages/${context.id}/blocks/sync`, { deltaBlocks: deltas });
  return Promise.resolve() // 임시 반환 (또는 업데이트된 블록 목록)
}

// --- useWikiPageBlocksSync 훅 ---

// useWikiPageBlocksSync 훅의 Props 타입 정의
interface UseWikiPageBlocksSyncProps {
  wikiPageContext: GetWikiPageResponse // 위키 페이지 전체 데이터 컨텍스트
  canEdit: boolean
}

// useWikiPageBlocksSync 훅의 반환 타입 정의
interface UseWikiPageBlocksSyncReturn {
  initialBlocks: WikiBlock[] | null
  isLoadingBlocks: boolean
  syncState: SyncState
  handleDocUpdate: (doc: PMNode) => void
}

/**
 * 위키 페이지 문서의 블록 동기화를 처리하는 훅.
 * 내부적으로 useInternalBlocksSyncLogic를 사용하며, 위키 페이지 관련 서비스 함수들을 주입합니다.
 */
export function useWikiPageBlocksSync({
  wikiPageContext,
  canEdit,
}: UseWikiPageBlocksSyncProps): UseWikiPageBlocksSyncReturn {
  const internalSyncResult = useInternalBlocksSyncLogic<
    GetWikiPageResponse,
    WikiBlockType
  >({
    documentContext: wikiPageContext,
    canEdit,
    fetchBlocksFn: getWikiPageBlocks,
    syncDeltaBlocksFn: syncWikiPageDeltaBlocks,
    onBeforeBackupMerge: undefined, // 위키는 스냅샷 기능이 없으므로 콜백 제공 안 함
  })

  return {
    ...internalSyncResult,
    initialBlocks: internalSyncResult.initialBlocks as WikiBlock[] | null,
  }
}
