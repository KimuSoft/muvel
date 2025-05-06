import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Doc } from "yjs"

import { type Block, SnapshotReason } from "muvel-api-types"
import { getBlocksChange } from "~/features/novel-editor/utils/calculateBlockChanges"
import { saveSnapshot, updateEpisodeBlocks } from "~/api/api.episode"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import {
  mergeBlocks,
  shouldMerge,
} from "~/features/novel-editor/utils/mergeBlocks"
import { getLastSyncedIds, setLastSyncedIds } from "~/db/blockMeta"
import { loadYjsBlocks } from "~/db/loadYjsBlocks"
import { injectBlocksToYjs } from "~/db/injectBlocksToYjs"
import { debounce } from "lodash-es"

interface UseBlockSyncOptions {
  serverBlocks: Block[]
  isCloudSave: boolean
  onError?: (error: unknown) => void
  onMerge?: (mergedBlocks: Block[]) => void
  saveToLocal?: (blocks: Block[]) => void
  /**
   * debounce interval(ms) for syncing – default 300ms
   */
  debounceMs?: number
}

/**
 * 클라우드 ↔ 로컬 블록 동기화 훅
 *
 * 1. episodeId 변경 시 내부 상태를 완전히 리셋합니다.
 * 2. onChange 는 debounce 로 묶어 한 번에 한 요청만 전송합니다.
 * 3. stale‑closure, 경쟁 조건, Yjs 메모리 누수 등을 방지했습니다.
 */
export const useBlockSync = (
  episodeId: string,
  {
    serverBlocks,
    isCloudSave,
    onError,
    onMerge,
    saveToLocal,
    debounceMs = 300,
  }: UseBlockSyncOptions,
) => {
  // 상태 -------------------------------------------------------------
  const [initialBlocks, setInitialBlocks] = useState<Block[] | null>(null)
  const [syncState, setSyncState] = useState<SyncState>(SyncState.Synced)
  const [isReady, setIsReady] = useState(false)
  const [ydoc, setYDoc] = useState<Doc | null>(null)

  // refs -------------------------------------------------------------
  const originalBlocksRef = useRef<Block[]>([])
  const pendingRef = useRef<Promise<void> | null>(null)

  // -----------------------------------------------------------------
  // episodeId 가 바뀌면 모든 상태를 초기화
  useEffect(() => {
    // cleanup previous ydoc
    ydoc?.destroy()

    // hard reset
    setInitialBlocks(null)
    setIsReady(false)
    setSyncState(SyncState.Synced)
    originalBlocksRef.current = []
    pendingRef.current = null
    setYDoc(null)
  }, [episodeId])

  // -----------------------------------------------------------------
  // prepare – 서버/로컬 데이터 병합 & 초기화
  useEffect(() => {
    console.log(`[useBlockSync] episodeId: ${episodeId} blocks initialised`)
    let cancelled = false

    const prepare = async () => {
      try {
        const { blocks: localBlocks, ydoc: loadedDoc } =
          await loadYjsBlocks(episodeId)
        if (cancelled) return
        setYDoc(loadedDoc)

        const lastSyncedIds = await getLastSyncedIds(episodeId)

        if (shouldMerge({ serverBlocks, localBlocks, lastSyncedIds })) {
          if (isCloudSave) {
            try {
              await saveSnapshot(episodeId, SnapshotReason.Merge)
            } catch (err) {
              console.warn("Snapshot 저장 실패", err)
            }
          }

          const merged = mergeBlocks({
            serverBlocks,
            localBlocks,
            lastSyncedIds,
          })
          saveToLocal?.(merged)
          setInitialBlocks(merged)
          originalBlocksRef.current = merged
          await setLastSyncedIds(
            episodeId,
            merged.map((b) => b.id),
          )
          onMerge?.(merged)
        } else {
          saveToLocal?.(serverBlocks)
          setInitialBlocks(serverBlocks)
          originalBlocksRef.current = serverBlocks
          await setLastSyncedIds(
            episodeId,
            serverBlocks.map((b) => b.id),
          )
        }

        setIsReady(true)
      } catch (err) {
        onError?.(err)
        setIsReady(true)
      }
    }

    if (isCloudSave) void prepare()

    return () => {
      cancelled = true
    }
  }, [episodeId, isCloudSave])

  // -----------------------------------------------------------------
  // 실질적인 동기화 함수 (경쟁 방지 큐)
  const syncBlocks = useCallback(
    async (updated: Block[]) => {
      console.log(`[useBlockSync] episodeId: ${episodeId} syncing...`)
      if (!isCloudSave) return

      // 이전 sync 진행 중이면 끝날 때까지 대기
      if (pendingRef.current) {
        await pendingRef.current
      }

      const diff = getBlocksChange(originalBlocksRef.current, updated)
      if (!diff.length) return

      setSyncState(SyncState.Syncing)

      pendingRef.current = updateEpisodeBlocks(episodeId, diff)
        .then(async () => {
          originalBlocksRef.current = [...updated]
          await setLastSyncedIds(
            episodeId,
            updated.map((b) => b.id),
          )
          setSyncState(SyncState.Synced)
        })
        .catch((err) => {
          console.error("Block sync failed:", err)
          setSyncState(SyncState.Error)
          onError?.(err)
        })
        .finally(() => {
          pendingRef.current = null
        })

      await pendingRef.current // 호출자가 완료 시점을 알 수 있도록 대기
    },
    [episodeId, isCloudSave, onError],
  )

  // -----------------------------------------------------------------
  // debounce 래퍼 – deps 가 바뀌면 새 debounce 함수 생성 & 이전 것 cancel
  const debouncedSync = useMemo(
    () => debounce(syncBlocks, debounceMs),
    [syncBlocks, debounceMs],
  )

  useEffect(() => {
    return () => {
      debouncedSync.cancel()
    }
  }, [debouncedSync])

  // -----------------------------------------------------------------
  // 외부 노출 onChange
  const onChange = (blocks: Block[]) => {
    setSyncState(SyncState.Waiting)
    void debouncedSync(blocks)
  }

  // -----------------------------------------------------------------
  // 컴포넌트 언마운트 시 Yjs 리소스 해제
  useEffect(() => {
    return () => {
      ydoc?.destroy()
    }
  }, [ydoc])

  return {
    ydoc,
    initialBlocks,
    onChange,
    syncState,
    isReady,
  } as const
}
