import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  type Block,
  type GetEpisodeResponseDto,
  ShareType,
  SnapshotReason,
} from "muvel-api-types"
import { chunk, debounce } from "lodash-es"
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
  blockSyncState: SyncState
  handleDocUpdate: (doc: PMNode) => void
}

export function useBlocksSync({
  episode,
  canEdit,
}: UseBlocksSyncProps): UseBlocksSyncReturn {
  const [initialBlocks, setBlocks] = useState<Block[] | null>(null)
  const [isLoadingBlocks, setIsLoadingBlocks] = useState<boolean>(false)
  const originalBlocksRef = useRef<Block[] | null>(null)
  const [blockSyncState, setBlockSyncState] = useState<SyncState>(
    SyncState.Synced,
  )
  const { isOffline } = usePlatform()

  // 초기화 프로세스
  const init = async () => {
    setIsLoadingBlocks(true)

    // 값 초기화
    setBlocks(null)
    originalBlocksRef.current = null
    setBlockSyncState(SyncState.Syncing)

    try {
      // 로컬 소설이 아닐 경우
      if (episode.novel.share !== ShareType.Local) {
        // 백업된 데이터가 있는지 확인
        console.info("Checking for backup data...")
        const backupDelta = await findDeltaBlockBackup(episode.id)

        // 백업된 데이터가 있는 경우
        if (backupDelta && backupDelta.length) {
          console.info("Backup data found, syncing...")

          console.info("Making snapshot...")
          await saveCloudSnapshot(episode.id, SnapshotReason.Merge)
          console.info("Syncing backup data...")
          await syncDeltaBlocks(episode, backupDelta)
          toaster.success({
            title: "블록 동기화 완료",
            description:
              "오프라인 작업 또는 오류로 브라우저에 백업된 블록 데이터가 자동 동기화되었습니다. 만약을 대비해 동기화 이전 상태가 버전으로 백업되었습니다.",
          })
        }
      }

      // 초기 블록 데이터 가져오기
      console.info("Fetching initial blocks...")
      const fetchedBlocks = await getEpisodeBlocks(episode)
      console.info("Completed fetching initial blocks")

      setBlocks(fetchedBlocks)
      originalBlocksRef.current = fetchedBlocks
      setBlockSyncState(SyncState.Synced)
    } catch (e) {
      console.error("Failed to fetch initial blocks:", e)
      toaster.error({
        title: "블록 로딩 실패",
        description: "초기 블록 데이터를 가져오는 데 실패했습니다.",
      })
      setBlockSyncState(SyncState.Error)
    } finally {
      setIsLoadingBlocks(false)
    }
  }

  useEffect(() => {
    if (isLoadingBlocks) {
      console.info("Skipping block sync because loading is in progress.")
      return
    }

    if (isOffline) return

    void init()
  }, [episode.id, isOffline])

  const actualSaveBlocks = useCallback(
    async (doc: PMNode) => {
      if (!canEdit || originalBlocksRef.current === null) {
        if (blockSyncState === SyncState.Waiting)
          setBlockSyncState(SyncState.Synced)
        return
      }

      const newBlocks = docToBlocks(doc)
      const changes = getDeltaBlock(originalBlocksRef.current, newBlocks)

      // 오프라인이고 로컬 소설이 아닐 경우
      if (!navigator.onLine && episode.novel.share !== ShareType.Local) {
        console.info("Offline mode detected. Saving changes to IndexedDB.")
        await saveDeltaBlockBackup(episode.id, changes)
        setBlockSyncState(SyncState.Waiting)
        return
      }

      // 변경 사항이 없을 경우
      if (!changes.length) {
        if (blockSyncState === SyncState.Waiting) {
          setBlockSyncState(SyncState.Synced)
        }
        return
      }

      setBlockSyncState(SyncState.Syncing)
      try {
        for (const dChunk of chunk(changes, 30)) {
          await syncDeltaBlocks(episode, dChunk)
        }
        // TODO: chunk 시마다 반영하면 최적화 가능
        originalBlocksRef.current = [...newBlocks]
        await deleteDeltaBlockBackup(episode.id)
        setBlockSyncState(SyncState.Synced)
      } catch (e) {
        console.error("Failed to save block changes (via useBlocksSync):", e)
        toaster.error({
          title: "블록 저장 실패",
          description: "변경 사항을 저장하는 데 실패했습니다.",
        })
        setBlockSyncState(SyncState.Error)

        await saveDeltaBlockBackup(episode.id, changes)
      }
    },
    [canEdit, episode.id, blockSyncState],
  )

  useEffect(() => {
    // 디바운스된 함수가 항상 최신의 actualSaveBlocks를 참조하도록 ref 업데이트
    actualSaveBlocksRef.current = actualSaveBlocks
  }, [actualSaveBlocks])

  const actualSaveBlocksRef = useRef(actualSaveBlocks)

  const debouncedSave = useMemo(
    () =>
      debounce(
        (doc: PMNode) => {
          if (actualSaveBlocksRef.current) {
            actualSaveBlocksRef.current(doc)
          }
        },
        500,
        { maxWait: 5000 },
      ),
    [],
  )

  const handleDocUpdate = useCallback(
    (doc: PMNode) => {
      if (!canEdit || initialBlocks === null) return

      if (![SyncState.Syncing, SyncState.Error].includes(blockSyncState)) {
        setBlockSyncState(SyncState.Waiting)
      }
      debouncedSave(doc)
    },
    [canEdit, initialBlocks, debouncedSave, blockSyncState],
  )

  return {
    initialBlocks,
    isLoadingBlocks,
    blockSyncState,
    handleDocUpdate,
  }
}
