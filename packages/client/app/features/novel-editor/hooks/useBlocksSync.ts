import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Block, GetEpisodeResponseDto } from "muvel-api-types"
import { debounce } from "lodash-es"
import { getBlocksChange } from "~/features/novel-editor/utils/calculateBlockChanges"
import { toaster } from "~/components/ui/toaster"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import { Node as PMNode } from "prosemirror-model"
import { docToBlocks } from "~/features/novel-editor/utils/blockConverter"
import {
  getEpisodeBlocks,
  updateEpisodeBlocks,
} from "~/services/episodeService"

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
  const [isLoadingBlocks, setIsLoadingBlocks] = useState<boolean>(true)
  const originalBlocksRef = useRef<Block[] | null>(null)
  const [blockSyncState, setBlockSyncState] = useState<SyncState>(
    SyncState.Synced,
  )

  useEffect(() => {
    // episodeId가 없을 경우 초기화 및 로딩 중단
    if (!episode.id) {
      setIsLoadingBlocks(false)
      setBlocks([])
      originalBlocksRef.current = []
      setBlockSyncState(SyncState.Synced) // 또는 Error 상태로 처리
      return
    }

    let isMounted = true
    setIsLoadingBlocks(true)
    setBlocks(null) // 이전 블록 데이터 클리어
    originalBlocksRef.current = null
    setBlockSyncState(SyncState.Syncing)

    getEpisodeBlocks(episode)
      .then((fetchedBlocks) => {
        if (isMounted) {
          setBlocks(fetchedBlocks)
          originalBlocksRef.current = fetchedBlocks
          setBlockSyncState(SyncState.Synced)
        }
      })
      .catch((error) => {
        console.error("Failed to fetch initial blocks:", error)
        toaster.error({
          title: "블록 로딩 실패",
          description: "초기 블록 데이터를 가져오는 데 실패했습니다.",
        })
        if (isMounted) {
          setBlocks([])
          originalBlocksRef.current = []
          setBlockSyncState(SyncState.Error)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingBlocks(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [episode.id])

  const actualSaveBlocks = useCallback(
    async (doc: PMNode) => {
      if (!canEdit || originalBlocksRef.current === null) {
        if (blockSyncState === SyncState.Waiting)
          setBlockSyncState(SyncState.Synced)
        return
      }

      const newBlocks = docToBlocks(doc)

      // getBlocksChange의 두 번째 인자는 현재 UI에 표시된 블록 (newBlocks)
      // 첫 번째 인자는 마지막으로 저장 성공한 원본 블록 (originalBlocksRef.current)
      const changes = getBlocksChange(originalBlocksRef.current, newBlocks)

      if (!changes.length) {
        if (blockSyncState === SyncState.Waiting)
          setBlockSyncState(SyncState.Synced)
        return
      }

      setBlockSyncState(SyncState.Syncing)
      try {
        // API 함수 이름 충돌을 피하기 위해 apiUpdateEpisodeBlocks 사용
        await updateEpisodeBlocks(episode, changes)
        originalBlocksRef.current = [...newBlocks]
        // setBlocks([...newBlocks]); // 이미 handleBlocksUpdate에서 UI 상태는 업데이트됨
        setBlockSyncState(SyncState.Synced)
      } catch (e) {
        console.error("Failed to save block changes (via useBlocksSync):", e)
        toaster.error({
          title: "블록 저장 실패",
          description: "변경 사항을 저장하는 데 실패했습니다.",
        })
        setBlockSyncState(SyncState.Error)
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

      if (blockSyncState !== SyncState.Syncing) {
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
