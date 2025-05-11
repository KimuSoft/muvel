import type { GetEpisodeResponseDto } from "muvel-api-types"
import FlowEditorTemplate from "~/features/flow-editor/FlowEditorTemplate"
import React, { useEffect } from "react"
import { debounce } from "lodash-es"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import { updateEpisodeMetadata } from "~/services/episodeService"

const FlowEditorPage: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode,
}) => {
  const [syncState, setSyncState] = React.useState(SyncState.Synced)

  // TODO: useEpisodeSync 훅으로 리팩토링
  const debouncedUpdateTitle = debounce(async (title: string) => {
    setSyncState(SyncState.Syncing)
    await updateEpisodeMetadata(episode, { title })
    setSyncState(SyncState.Synced)
  }, 1000)

  const debouncedUpdateFlow = debounce(async (doc: any) => {
    setSyncState(SyncState.Syncing)
    await updateEpisodeMetadata(episode, { flowDoc: doc })
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
