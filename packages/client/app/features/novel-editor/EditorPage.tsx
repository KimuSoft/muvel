import React, { useEffect, useMemo } from "react" // useState, useCallback 제거 가능성 있음 (만약 모두 훅으로 이전된다면)
import type { GetEpisodeResponseDto } from "muvel-api-types" // Block 타입은 이제 useBlocksSync에서 주로 사용
import EditorTemplate from "~/features/novel-editor/EditorTemplate"
import { EditorProvider } from "~/features/novel-editor/context/EditorContext"
import OptionProvider from "~/providers/OptionProvider"
import { WidgetProvider } from "~/features/novel-editor/widgets/context/WidgetContext"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import LoadingOverlay from "~/components/templates/LoadingOverlay"
import { useEpisodeSync } from "~/features/novel-editor/hooks/useEpisodeSync"
import { useBlocksSync } from "./hooks/useBlocksSync"

const EditorPage: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode: initialEpisode,
}) => {
  const { episodeData, setEpisodeData, episodeSyncState } = useEpisodeSync({
    initialEpisode,
  })

  const { blockSyncState, initialBlocks, handleDocUpdate } = useBlocksSync({
    episodeId: initialEpisode.id,
    canEdit: !!initialEpisode.permissions.edit,
  })

  const combinedSyncState = useMemo(() => {
    if (
      episodeSyncState === SyncState.Error ||
      blockSyncState === SyncState.Error
    ) {
      return SyncState.Error
    }
    if (
      episodeSyncState === SyncState.Syncing ||
      blockSyncState === SyncState.Syncing
    ) {
      return SyncState.Syncing
    }
    if (
      episodeSyncState === SyncState.Waiting ||
      blockSyncState === SyncState.Waiting
    ) {
      return SyncState.Waiting
    }
    return SyncState.Synced
  }, [episodeSyncState, blockSyncState])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (![SyncState.Synced, SyncState.Waiting].includes(combinedSyncState)) {
        event.preventDefault()
        event.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [combinedSyncState])

  useEffect(() => {
    console.log("episodeData has Changed")
  }, [episodeData])

  if (!episodeData || !initialBlocks) {
    return <LoadingOverlay />
  }

  return (
    <OptionProvider>
      <WidgetProvider>
        <EditorProvider episode={episodeData} setEpisode={setEpisodeData}>
          <EditorTemplate
            initialBlocks={initialBlocks}
            onDocChange={handleDocUpdate}
            syncState={combinedSyncState}
          />
        </EditorProvider>
      </WidgetProvider>
    </OptionProvider>
  )
}

export default EditorPage
