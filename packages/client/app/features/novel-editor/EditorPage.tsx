import React, { useEffect, useMemo } from "react"
import type { GetEpisodeResponseDto } from "muvel-api-types"
import EditorTemplate from "~/features/novel-editor/EditorTemplate"
import { EditorProvider } from "~/features/novel-editor/context/EditorContext"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import LoadingOverlay from "~/components/templates/LoadingOverlay"
import { useEpisodeMetadataSync } from "~/features/novel-editor/hooks/useEpisodeMetadataSync"
import { combineSyncStates } from "~/utils/combineSyncStates"
import { useEpisodeBlocksSync } from "~/features/novel-editor/hooks/useEpisodeBlocksSync"
import { EpisodeProvider } from "~/providers/EpisodeProvider"

const EditorPage: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode: initialEpisode,
}) => {
  const {
    episodeData,
    setEpisodeData,
    syncState: episodeSyncState,
  } = useEpisodeMetadataSync({
    initialEpisode,
  })

  const {
    syncState: blockSyncState,
    initialBlocks,
    isLoadingBlocks,
    handleDocUpdate,
  } = useEpisodeBlocksSync({
    episodeContext: initialEpisode,
    canEdit: !!initialEpisode.permissions.edit,
  })

  const combinedSyncState = useMemo(() => {
    return combineSyncStates(episodeSyncState, blockSyncState)
  }, [episodeSyncState, blockSyncState])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (![SyncState.Synced, SyncState.Waiting].includes(combinedSyncState)) {
        event.preventDefault()
        // 호환성 위해 설정
        event.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [combinedSyncState])

  if (!episodeData || !initialBlocks || isLoadingBlocks) {
    return <LoadingOverlay />
  }

  return (
    <EditorProvider onDocUpdate={handleDocUpdate}>
      <EpisodeProvider
        episode={episodeData}
        setEpisode={setEpisodeData}
        syncState={combinedSyncState}
      >
        <EditorTemplate
          key={initialEpisode.id + "-title"}
          initialBlocks={initialBlocks}
        />
      </EpisodeProvider>
    </EditorProvider>
  )
}

export default EditorPage
