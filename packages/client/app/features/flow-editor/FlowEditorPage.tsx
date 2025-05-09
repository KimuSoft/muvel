import type { GetEpisodeResponseDto } from "muvel-api-types"
import FlowEditorTemplate from "~/features/flow-editor/FlowEditorTemplate"
import React, { useEffect } from "react"
import { debounce } from "lodash-es"
import { updateEpisode } from "~/services/api/api.episode"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"

const FlowEditorPage: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode,
}) => {
  const [syncState, setSyncState] = React.useState(SyncState.Synced)

  const debouncedUpdateTitle = debounce(async (title: string) => {
    setSyncState(SyncState.Syncing)
    await updateEpisode(episode.id, { title })
    setSyncState(SyncState.Synced)
  }, 1000)

  const debouncedUpdateFlow = debounce(async (doc: any) => {
    setSyncState(SyncState.Syncing)
    await updateEpisode(episode.id, { flowDoc: doc })
    setSyncState(SyncState.Synced)
  }, 5000)

  const titleChangeHandler = (title: string) => {
    setSyncState(SyncState.Waiting)
    void debouncedUpdateTitle(title)
  }

  const flowChangeHandler = (doc: any) => {
    setSyncState(SyncState.Waiting)
    void debouncedUpdateFlow(doc)
  }

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

  return (
    <FlowEditorTemplate
      episode={episode}
      onTitleChange={titleChangeHandler}
      onFlowChange={flowChangeHandler}
      syncState={syncState}
    />
  )
}

export default FlowEditorPage
