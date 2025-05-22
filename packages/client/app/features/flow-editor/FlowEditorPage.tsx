import type { GetEpisodeResponseDto } from "muvel-api-types"
import FlowEditorTemplate from "~/features/flow-editor/FlowEditorTemplate"
import React, { useEffect } from "react"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import { EpisodeProvider } from "~/providers/EpisodeProvider"
import { useEpisodeMetadataSync } from "~/features/novel-editor/hooks/useEpisodeMetadataSync"
import LoadingOverlay from "~/components/templates/LoadingOverlay"

const FlowEditorPage: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode,
}) => {
  const { syncState, episodeData, setEpisodeData } = useEpisodeMetadataSync({
    initialEpisode: episode,
  })

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (syncState !== SyncState.Synced) {
        event.preventDefault()
        event.returnValue = "" // Chrome에서는 이게 필수
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [syncState])

  if (!episodeData) {
    return <LoadingOverlay />
  }

  return (
    <EpisodeProvider
      episode={episodeData}
      setEpisode={setEpisodeData}
      syncState={syncState}
    >
      <FlowEditorTemplate />
    </EpisodeProvider>
  )
}

export default FlowEditorPage
