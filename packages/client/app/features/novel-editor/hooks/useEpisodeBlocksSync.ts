import {
  type BaseBlock,
  type DeltaBlock,
  type EpisodeBlockType,
  type GetEpisodeResponseDto,
  type SnapshotReason,
} from "muvel-api-types"
import {
  getEpisodeBlocks,
  syncDeltaBlocks as syncEpisodeDeltaBlocksService,
} from "~/services/episodeService"
import { saveCloudSnapshot } from "~/services/api/api.episode"
import { Node as PMNode } from "prosemirror-model"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import { useInternalBlocksSyncLogic } from "~/hooks/useInternalBlocksSyncLogic"

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
  const handleBeforeBackupMergeForEpisode = async (
    documentId: string,
    reason: SnapshotReason,
  ): Promise<void> => {
    await saveCloudSnapshot(documentId, reason)
  }

  const internalSyncResult = useInternalBlocksSyncLogic<
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
    onBeforeBackupMerge: handleBeforeBackupMergeForEpisode,
  })

  return {
    ...internalSyncResult,
    initialBlocks: internalSyncResult.initialBlocks as
      | BaseBlock<EpisodeBlockType>[]
      | null,
  }
}
