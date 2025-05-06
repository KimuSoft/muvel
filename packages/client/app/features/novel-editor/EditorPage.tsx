import React, { useEffect } from "react"
import type { Block, GetEpisodeResponseDto } from "muvel-api-types"
import EditorTemplate from "~/features/novel-editor/EditorTemplate"
import { EditorProvider } from "~/features/novel-editor/context/EditorContext"
import OptionProvider from "~/providers/OptionProvider"
import { WidgetProvider } from "~/features/novel-editor/widgets/context/WidgetContext"
import { useEpisodeSync } from "~/features/novel-editor/hooks/useEpisodeSync"
import { useBlockSync } from "~/features/novel-editor/hooks/useBlockSync"
import { toaster } from "~/components/ui/toaster"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import LoadingOverlay from "~/components/templates/LoadingOverlay"
import { usePlatform } from "~/hooks/usePlatform"

const EditorPage: React.FC<{
  episode: GetEpisodeResponseDto
  blocks: Block[]
}> = ({ episode: initialEpisodeData, blocks: initialBlocks_ }) => {
  const {
    episode,
    updateEpisode,
    fetchLatestEpisode,
    syncState: metaSyncState,
  } = useEpisodeSync(initialEpisodeData.id, {
    initialEpisode: initialEpisodeData,
    onError: (err) => {
      toaster.error({
        title: "에피소드 저장 실패",
        description: err instanceof Error ? err.message : String(err),
      })
    },
  })

  useEffect(() => {
    console.log("실행대써요!")
  }, [])

  const { isOffline } = usePlatform()

  const {
    initialBlocks,
    onChange: handleBlocksChange,
    syncState: blockSyncState,
    isReady,
  } = useBlockSync(initialEpisodeData.id, {
    serverBlocks: initialBlocks_,
    isCloudSave: !isOffline,
    onMerge: () => {
      toaster.info({
        title: "자동 병합됨",
        description:
          "동기화 중 충돌이 발생하여 자동 병합되었습니다. 병합 이전 버전이 백업되었으므로, 문제가 생긴 경우 '버전 관리'에서 복원할 수 있습니다.",
      })
    },
    onError: (err) => {
      toaster.error({
        title: "블록 저장 실패",
        description: err instanceof Error ? err.message : String(err),
      })
    },
  })

  const mergedSyncState = [metaSyncState, blockSyncState].includes(
    SyncState.Error,
  )
    ? SyncState.Error
    : [metaSyncState, blockSyncState].includes(SyncState.Syncing)
      ? SyncState.Syncing
      : [metaSyncState, blockSyncState].includes(SyncState.Waiting)
        ? SyncState.Waiting
        : SyncState.Synced

  if (!isReady || !episode || !initialBlocks) {
    return <LoadingOverlay message={"초기 데이터 불러오는 중..."} />
  }

  return (
    <OptionProvider>
      <WidgetProvider>
        <EditorProvider
          episode={episode}
          setEpisode={updateEpisode}
          fetchLatestEpisode={fetchLatestEpisode}
        >
          <EditorTemplate
            initialBlocks={initialBlocks}
            onBlocksChange={handleBlocksChange}
            syncState={mergedSyncState}
          />
        </EditorProvider>
      </WidgetProvider>
    </OptionProvider>
  )
}

export default EditorPage
