import { useCallback, useEffect, useRef, useState } from "react"
import {
  type DeltaBlock,
  type MuvelBlockType,
  type PartialBlock,
  ShareType,
  SnapshotReason,
} from "muvel-api-types"
import { chunk } from "lodash-es"
import { useDebouncedCallback } from "use-debounce"
import { Node as PMNode } from "prosemirror-model"

import { toaster } from "~/components/ui/toaster"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import { docToBlocks } from "~/features/novel-editor/utils/blockConverter"
import { getDeltaBlock } from "~/features/novel-editor/utils/getDeltaBlocks"
import {
  deleteDeltaBlockBackup,
  findDeltaBlockBackup,
  saveDeltaBlockBackup,
} from "~/utils/indexeddb"
import { usePlatform } from "~/hooks/usePlatform" // usePlatform 훅은 이미 isOffline 상태를 제공

// 문서의 기본 컨텍스트 인터페이스
export interface DocumentContextForSync {
  id: string
  novel: {
    share: ShareType
    // novelId 등 추가 정보가 필요하다면 여기에 포함
  }
  [key: string]: any // GetEpisodeResponseDto 또는 GetWikiPageResponseDto 등의 전체 타입을 허용
}

// useInternalBlocksSyncLogic 훅의 Props 타입 정의
interface UseInternalBlocksSyncLogicProps<
  DataType extends DocumentContextForSync,
  BlockType extends MuvelBlockType, // EpisodeBlockType 또는 WikiBlockType 등
> {
  documentContext: DataType
  canEdit: boolean
  // isOffline은 usePlatform()을 통해 내부에서 가져오므로 prop으로 받을 필요 없음
  fetchBlocksFn: (context: DataType) => Promise<PartialBlock<BlockType>[]>
  syncDeltaBlocksFn: (
    context: DataType,
    deltas: DeltaBlock<BlockType>[],
  ) => Promise<void | PartialBlock<BlockType>[]>
  /**
   * IndexedDB에 저장된 백업 데이터를 병합하기 직전에 호출되는 선택적 콜백 함수.
   * 예를 들어, 에피소드의 경우 이 시점에서 스냅샷을 생성할 수 있습니다.
   */
  onBeforeBackupMerge?: (
    documentId: string,
    reason: SnapshotReason,
  ) => Promise<void>
}

// useInternalBlocksSyncLogic 훅의 반환 타입 정의
interface UseInternalBlocksSyncLogicReturn<BlockType extends MuvelBlockType> {
  initialBlocks: PartialBlock<BlockType>[] | null
  isLoadingBlocks: boolean
  syncState: SyncState
  handleDocUpdate: (doc: PMNode) => void
}

export function useInternalBlocksSyncLogic<
  DataType extends DocumentContextForSync,
  BlockType extends MuvelBlockType, // 제네릭 이름을 BlockType으로 명확히 함
>({
  documentContext,
  canEdit,
  fetchBlocksFn,
  syncDeltaBlocksFn,
  onBeforeBackupMerge,
}: UseInternalBlocksSyncLogicProps<
  DataType,
  BlockType
>): UseInternalBlocksSyncLogicReturn<BlockType> {
  const [initialBlocks, setInitialBlocks] = useState<
    PartialBlock<BlockType>[] | null
  >(null)
  const [isLoadingBlocks, setIsLoadingBlocks] = useState<boolean>(false)
  const originalBlocksRef = useRef<PartialBlock<BlockType>[] | null>(null)
  const [syncState, setSyncState] = useState<SyncState>(SyncState.Synced)

  const { isOffline } = usePlatform() // 훅 내부에서 isOffline 상태 직접 사용

  const currentDocumentIdRef = useRef<string | null>(documentContext.id)
  const isInitializedForCurrentDocumentRef = useRef<boolean>(false)
  const prevIsOfflineRef = useRef<boolean>(isOffline)

  const init = useCallback(async () => {
    setIsLoadingBlocks(true)
    setInitialBlocks(null)
    originalBlocksRef.current = null
    setSyncState(SyncState.Syncing)
    currentDocumentIdRef.current = documentContext.id

    try {
      const { id: docId, novel } = documentContext
      const shareType = novel.share

      if (shareType !== ShareType.Local) {
        const backupDelta = await findDeltaBlockBackup(docId)
        if (backupDelta && backupDelta.length > 0) {
          if (onBeforeBackupMerge) {
            await onBeforeBackupMerge(docId, SnapshotReason.Merge)
          } else {
            console.warn(
              `[${docId}] onBeforeBackupMerge is not provided. Skipping pre-merge operations.`,
            )
          }
          await syncDeltaBlocksFn(
            documentContext,
            backupDelta as DeltaBlock<BlockType>[],
          )
          toaster.success({
            title: "블록 동기화 완료",
            description:
              "오프라인 작업 또는 오류로 브라우저에 백업된 블록 데이터가 자동 동기화되었습니다.",
          })
          await deleteDeltaBlockBackup(docId)
        }
      }

      const fetchedBlocks = await fetchBlocksFn(documentContext)
      setInitialBlocks(fetchedBlocks)
      originalBlocksRef.current = fetchedBlocks
      setSyncState(SyncState.Synced)
      isInitializedForCurrentDocumentRef.current = true
    } catch (e) {
      console.error(`[${documentContext.id}] Failed to initialize blocks:`, e)
      toaster.error({
        title: "블록 로딩 실패",
        description: "초기 블록 데이터를 가져오는 데 실패했습니다.",
      })
      setSyncState(SyncState.Error)
    } finally {
      setIsLoadingBlocks(false)
    }
  }, [documentContext, fetchBlocksFn, syncDeltaBlocksFn, onBeforeBackupMerge])

  useEffect(() => {
    if (currentDocumentIdRef.current !== documentContext.id) {
      isInitializedForCurrentDocumentRef.current = false
    }
  }, [documentContext.id])

  useEffect(() => {
    if (isLoadingBlocks) {
      return
    }
    const isOnlineNow = !isOffline
    const justCameOnline = prevIsOfflineRef.current && isOnlineNow
    const shareType = documentContext.novel.share

    if (!isInitializedForCurrentDocumentRef.current || justCameOnline) {
      if (isOnlineNow || shareType === ShareType.Local) {
        void init()
      }
    }
    prevIsOfflineRef.current = isOffline
  }, [
    documentContext.id,
    documentContext.novel.share,
    isOffline,
    isLoadingBlocks,
    init,
  ])

  const actualSaveBlocks = useCallback(
    async (doc: PMNode) => {
      if (syncState === SyncState.Syncing) return

      if (!canEdit || originalBlocksRef.current === null) {
        if (syncState === SyncState.Waiting) {
          setSyncState(SyncState.Synced)
        }
        return
      }

      setSyncState(SyncState.Syncing)
      const newBlocks = docToBlocks<BlockType>(doc)

      const changes = getDeltaBlock<BlockType>(
        originalBlocksRef.current,
        newBlocks,
      )

      const { id: docId, novel } = documentContext
      const shareType = novel.share

      if (isOffline && shareType !== ShareType.Local) {
        if (changes.length > 0) {
          await saveDeltaBlockBackup(docId, changes)
          toaster.info({
            title: "오프라인 저장",
            description:
              "변경 사항이 브라우저에 임시 저장되었습니다. 온라인 상태가 되면 동기화됩니다.",
          })
        }
        setSyncState(SyncState.Waiting)
        return
      }

      if (changes.length === 0) {
        if (syncState === SyncState.Waiting) {
          setSyncState(SyncState.Synced)
        }
        return
      }

      try {
        if (shareType === ShareType.Local) {
          await syncDeltaBlocksFn(documentContext, changes)
        } else {
          for (const deltaChunk of chunk(changes, 100)) {
            await syncDeltaBlocksFn(documentContext, deltaChunk)
          }
        }
        originalBlocksRef.current = [...newBlocks]
        if (shareType !== ShareType.Local) {
          await deleteDeltaBlockBackup(docId)
        }
        setSyncState(SyncState.Synced)
      } catch (e) {
        console.error(`[${docId}] Failed to save block changes:`, e)
        toaster.error({
          title: "블록 저장 실패",
          description:
            "변경 사항을 서버에 저장하는 데 실패했습니다. 변경 사항은 브라우저에 임시 저장됩니다.",
        })
        setSyncState(SyncState.Error)
        if (shareType !== ShareType.Local && changes.length > 0) {
          await saveDeltaBlockBackup(docId, changes)
        }
      }
    },
    [canEdit, documentContext, isOffline, syncState, syncDeltaBlocksFn],
  )

  const debouncedSaveBlocks = useDebouncedCallback(actualSaveBlocks, 500, {
    maxWait: 3000,
  })

  const handleDocUpdate = useCallback(
    (doc: PMNode) => {
      if (!canEdit || initialBlocks === null) return

      setSyncState((s) =>
        syncState !== SyncState.Syncing && syncState !== SyncState.Error
          ? SyncState.Waiting
          : s,
      )

      debouncedSaveBlocks(doc)
    },
    [canEdit, initialBlocks, debouncedSaveBlocks],
  )

  useEffect(() => {
    return () => {
      debouncedSaveBlocks.cancel()
    }
  }, [documentContext.id, debouncedSaveBlocks])

  return {
    initialBlocks,
    isLoadingBlocks,
    syncState,
    handleDocUpdate,
  }
}
