import { useEffect, useRef, useState } from "react"
import { type Block, SnapshotReason } from "muvel-api-types"
import { getBlocksChange } from "~/features/novel-editor/utils/calculateBlockChanges"
import { saveSnapshot, updateEpisodeBlocks } from "~/api/api.episode"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import { debounce } from "lodash-es"
import {
  mergeBlocks,
  shouldMerge,
} from "~/features/novel-editor/utils/mergeBlocks"
import { getLastSyncedIds, setLastSyncedIds } from "~/db/blockMeta"
import { loadYjsBlocks } from "~/db/loadYjsBlocks"
import { Doc } from "yjs"

interface UseBlockSyncOptions {
  serverBlocks: Block[]
  isOnline: boolean
  onError?: (error: unknown) => void
  onMerge?: (mergedBlocks: Block[]) => void
  saveToLocal?: (blocks: Block[]) => void
}

export function useBlockSync(episodeId: string, options: UseBlockSyncOptions) {
  const { serverBlocks, isOnline, onError, onMerge, saveToLocal } = options

  const [initialBlocks, setInitialBlocks] = useState<Block[]>([])
  const [syncState, setSyncState] = useState<SyncState>(SyncState.Synced)
  const [isReady, setIsReady] = useState(false)
  const originalBlocksRef = useRef<Block[]>([])
  const [ydoc, setYDoc] = useState<Doc | undefined>()

  useEffect(() => {
    const prepare = async () => {
      console.log("동기화할게염!")
      try {
        const { blocks: localBlocks, ydoc } = await loadYjsBlocks(episodeId)
        setYDoc(ydoc)

        const lastSyncedIds = await getLastSyncedIds(episodeId)

        if (shouldMerge({ serverBlocks, localBlocks, lastSyncedIds })) {
          console.log("병합할게염!")
          if (isOnline) {
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

    if (isOnline) void prepare()
  }, [episodeId, serverBlocks, isOnline])

  const handleChange = useRef(
    debounce(async (updated: Block[]) => {
      const diff = getBlocksChange(originalBlocksRef.current, updated)
      if (!diff.length || !isOnline) return

      setSyncState(SyncState.Syncing)
      try {
        await updateEpisodeBlocks(episodeId, diff)
        originalBlocksRef.current = [...updated]
        await setLastSyncedIds(
          episodeId,
          updated.map((b) => b.id),
        )
        setSyncState(SyncState.Synced)
      } catch (err) {
        console.error("Block sync failed:", err)
        setSyncState(SyncState.Error)
        onError?.(err)
      }
    }, 1000),
  ).current

  const onChange = async (blocks: Block[]) => {
    console.log("onChange!")
    setSyncState(SyncState.Waiting)
    await handleChange(blocks)
  }

  return {
    ydoc,
    initialBlocks,
    onChange,
    syncState,
    isReady,
  }
}
