import {
  type BaseBlock,
  type DeltaBlock,
  type EpisodeBlockType,
  type GetEpisodeResponseDto,
  SnapshotReason,
} from "muvel-api-types"
import {
  type EpisodeContext,
  getEpisodeBlocks,
  syncDeltaBlocks as syncEpisodeDeltaBlocksService,
} from "~/services/episodeService"
import { Node as PMNode } from "prosemirror-model"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import { useInternalBlocksSyncLogic } from "~/hooks/useInternalBlocksSyncLogic"
import { useDebouncedCallback } from "use-debounce"
import { saveEpisodeSnapshot } from "~/services/episodeSnapshotService"
import { useEffect } from "react"

// useEpisodeBlocksSync 훅의 Props 타입 정의
interface UseEpisodeBlocksSyncProps {
  episodeContext: GetEpisodeResponseDto // 에피소드 전체 데이터 컨텍스트
  canEdit: boolean
}

// useEpisodeBlocksSync 훅의 반환 타입 정의
interface UseEpisodeBlocksSyncReturn {
  initialBlocks: BaseBlock<EpisodeBlockType>[] | null
  isLoadingBlocks: boolean
  syncState: SyncState
  handleDocUpdate: (doc: PMNode) => void
}

/**
 * 에피소드 문서의 블록 동기화를 처리하는 훅.
 * 내부적으로 useInternalBlocksSyncLogic를 사용하며, 에피소드 관련 서비스 함수들을 주입합니다.
 */
export function useEpisodeBlocksSync({
  episodeContext,
  canEdit,
}: UseEpisodeBlocksSyncProps): UseEpisodeBlocksSyncReturn {
  const { handleDocUpdate, ...internalSyncResult } = useInternalBlocksSyncLogic<
    GetEpisodeResponseDto,
    EpisodeBlockType
  >({
    documentContext: episodeContext,
    canEdit,
    fetchBlocksFn: (context) => getEpisodeBlocks(context),
    syncDeltaBlocksFn: (context, deltas) =>
      syncEpisodeDeltaBlocksService(
        context,
        deltas as DeltaBlock<EpisodeBlockType>[],
      ),
    onBeforeBackupMerge: async () => {
      await saveEpisodeSnapshot(episodeContext, SnapshotReason.Merge)
    },
  })

  const debouncedAutoSave = useDebouncedCallback(
    async (episodeContext: EpisodeContext) => {
      await saveEpisodeSnapshot(episodeContext, SnapshotReason.Autosave)
      console.log(episodeContext.id + ": 스냅샷 저장 완료")
    },
    1000 * 60 * 10,
    { maxWait: 1000 * 60 * 10 },
  )

  useEffect(() => {
    console.log(episodeContext.id + "로그")
    return () => {
      debouncedAutoSave.flush()
    }
  }, [episodeContext.id])

  const handleDocUpdate_ = (doc: PMNode) => {
    debouncedAutoSave(episodeContext)
    handleDocUpdate(doc)
  }

  return {
    ...internalSyncResult,
    handleDocUpdate: handleDocUpdate_,
    initialBlocks: internalSyncResult.initialBlocks as
      | BaseBlock<EpisodeBlockType>[]
      | null,
  }
}
