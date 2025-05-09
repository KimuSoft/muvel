import React, { useEffect, useMemo } from "react"
import type { GetEpisodeResponseDto } from "muvel-api-types"
import EditorTemplate from "~/features/novel-editor/EditorTemplate"
import { EditorProvider } from "~/features/novel-editor/context/EditorContext"
import OptionProvider from "~/providers/OptionProvider"
import { WidgetProvider } from "~/features/novel-editor/widgets/context/WidgetContext"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import LoadingOverlay from "~/components/templates/LoadingOverlay"
import { useEpisodeSync } from "~/features/novel-editor/hooks/useEpisodeSync"
import { useBlocksSync } from "./hooks/useBlocksSync"
import { combineSyncStates } from "~/utils/combineSyncStates"

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
