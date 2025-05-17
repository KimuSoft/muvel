import React, { useEffect, useMemo } from "react"
import type { GetEpisodeResponseDto } from "muvel-api-types"
import EditorTemplate from "~/features/novel-editor/EditorTemplate"
import { EditorProvider } from "~/features/novel-editor/context/EditorContext"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import LoadingOverlay from "~/components/templates/LoadingOverlay"
import { useEpisodeSync } from "~/features/novel-editor/hooks/useEpisodeSync"
import { combineSyncStates } from "~/utils/combineSyncStates"
import { useBlocksSync } from "~/features/novel-editor/hooks/useBlocksSync"

const EditorPage: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode: initialEpisode,
}) => {
  const { episodeData, setEpisodeData, episodeSyncState } = useEpisodeSync({
    initialEpisode,
  })

  const { blockSyncState, initialBlocks, handleDocUpdate } = useBlocksSync({
    episode: initialEpisode,
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

  if (!episodeData || !initialBlocks) {
    return <LoadingOverlay />
  }

  return (
    <EditorProvider episode={episodeData} setEpisode={setEpisodeData}>
      <EditorTemplate
        initialBlocks={initialBlocks}
        onDocChange={handleDocUpdate}
        syncState={combinedSyncState}
      />
    </EditorProvider>
  )
}

export default EditorPage
