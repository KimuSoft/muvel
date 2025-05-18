import { useCallback, useEffect, useRef, useState } from "react"
import {
  type Block,
  type GetEpisodeResponseDto,
  ShareType,
  SnapshotReason,
} from "muvel-api-types"
import { chunk } from "lodash-es"
import { useDebouncedCallback } from "use-debounce"
import { toaster } from "~/components/ui/toaster"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import { Node as PMNode } from "prosemirror-model"
import { docToBlocks } from "~/features/novel-editor/utils/blockConverter"
import { getEpisodeBlocks, syncDeltaBlocks } from "~/services/episodeService"
import { getDeltaBlock } from "~/features/novel-editor/utils/getDeltaBlocks"
import {
  deleteDeltaBlockBackup,
  findDeltaBlockBackup,
  saveDeltaBlockBackup,
} from "~/utils/indexeddb"
import { saveCloudSnapshot } from "~/services/api/api.episode"
import { usePlatform } from "~/hooks/usePlatform"

interface UseBlocksSyncProps {
  episode: GetEpisodeResponseDto
  canEdit: boolean
}

interface UseBlocksSyncReturn {
  initialBlocks: Block[] | null
  isLoadingBlocks: boolean
  syncState: SyncState
  handleDocUpdate: (doc: PMNode) => void
}

export function useBlocksSync({
  episode,
  canEdit,
}: UseBlocksSyncProps): UseBlocksSyncReturn {
  const [initialBlocks, setBlocks] = useState<Block[] | null>(null)
  const [isLoadingBlocks, setIsLoadingBlocks] = useState<boolean>(false)
  const originalBlocksRef = useRef<Block[] | null>(null)
  const [syncState, setSyncState] = useState<SyncState>(SyncState.Synced)
  const { isOffline } = usePlatform()

  const isInitializedForCurrentEpisodeRef = useRef(false)
  const prevIsOfflineRef = useRef(isOffline)

  const init = useCallback(async () => {
    setIsLoadingBlocks(true)
    setBlocks(null)
    originalBlocksRef.current = null
    setSyncState(SyncState.Syncing)

    try {
      if (episode.novel.share !== ShareType.Local) {
        const backupDelta = await findDeltaBlockBackup(episode.id)

        if (backupDelta && backupDelta.length > 0) {
          await saveCloudSnapshot(episode.id, SnapshotReason.Merge)
          await syncDeltaBlocks(episode, backupDelta)
          toaster.success({
            title: "블록 동기화 완료",
            description:
              "오프라인 작업 또는 오류로 브라우저에 백업된 블록 데이터가 자동 동기화되었습니다. 만약을 대비해 동기화 이전 상태가 버전으로 백업되었습니다.",
          })
          await deleteDeltaBlockBackup(episode.id)
        }
      }

      const fetchedBlocks = await getEpisodeBlocks(episode)

      setBlocks(fetchedBlocks)
      originalBlocksRef.current = fetchedBlocks
      setSyncState(SyncState.Synced)
      isInitializedForCurrentEpisodeRef.current = true
    } catch (e) {
      console.error(`[${episode.id}] Failed to initialize blocks:`, e)
      toaster.error({
        title: "블록 로딩 실패",
        description: "초기 블록 데이터를 가져오는 데 실패했습니다.",
      })
      setSyncState(SyncState.Error)
    } finally {
      setIsLoadingBlocks(false)
    }
  }, [episode])

  useEffect(() => {
    isInitializedForCurrentEpisodeRef.current = false
  }, [episode.id])

  useEffect(() => {
    if (isLoadingBlocks) {
      return
    }

    const isOnline = !isOffline
    const justCameOnline = prevIsOfflineRef.current && isOnline

    if (!isInitializedForCurrentEpisodeRef.current || justCameOnline) {
      if (isOnline || episode.novel.share === ShareType.Local) {
        void init()
      }
    }
    prevIsOfflineRef.current = isOffline
  }, [episode.id, episode.novel.share, isOffline, isLoadingBlocks, init])

  const actualSaveBlocks = useCallback(
    async (doc: PMNode) => {
      if (syncState === SyncState.Syncing) {
        return console.warn("Already syncing")
      }

      if (!canEdit || originalBlocksRef.current === null) {
        if (syncState === SyncState.Waiting) {
          setSyncState(SyncState.Synced)
        }
        return
      }

      setSyncState(SyncState.Syncing)
      const newBlocks = docToBlocks(doc)
      const changes = getDeltaBlock(originalBlocksRef.current, newBlocks)

      if (isOffline && episode.novel.share !== ShareType.Local) {
        if (changes.length > 0) {
          await saveDeltaBlockBackup(episode.id, changes)
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
        if (episode.novel.share === ShareType.Local) {
          // 로컬이면 청크 없이 한 번에 저장
          await syncDeltaBlocks(episode, changes)
        } else {
          for (const dChunk of chunk(changes, 100)) {
            await syncDeltaBlocks(episode, dChunk)
          }
        }
        originalBlocksRef.current = [...newBlocks]

        if (episode.novel.share !== ShareType.Local) {
          await deleteDeltaBlockBackup(episode.id)
        }
        setSyncState(SyncState.Synced)
      } catch (e) {
        console.error(`[${episode.id}] Failed to save block changes:`, e)
        toaster.error({
          title: "블록 저장 실패",
          description:
            "변경 사항을 서버에 저장하는 데 실패했습니다. 변경 사항은 브라우저에 임시 저장됩니다.",
        })
        setSyncState(SyncState.Error)

        if (episode.novel.share !== ShareType.Local && changes.length > 0) {
          await saveDeltaBlockBackup(episode.id, changes)
        }
      }
    },
    [canEdit, episode, syncState, isOffline],
  )

  const debouncedSaveBlocks = useDebouncedCallback(actualSaveBlocks, 500, {
    maxWait: 2000,
  })

  const handleDocUpdate = useCallback(
    (doc: PMNode) => {
      if (!canEdit || initialBlocks === null) return

      if (syncState !== SyncState.Syncing && syncState !== SyncState.Error) {
        setSyncState(SyncState.Waiting)
      }
      debouncedSaveBlocks(doc)
    },
    [canEdit, initialBlocks, debouncedSaveBlocks, syncState],
  )

  useEffect(() => {
    return () => {
      debouncedSaveBlocks.cancel()
    }
  }, [episode.id, debouncedSaveBlocks])

  return {
    initialBlocks,
    isLoadingBlocks,
    syncState,
    handleDocUpdate,
  }
}
