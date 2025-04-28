import type { GetEpisodeResponseDto } from "muvel-api-types"
import FlowEditorTemplate from "~/features/flow-editor/FlowEditorTemplate"
import React from "react"
import { debounce } from "lodash-es"
import { updateEpisode } from "~/api/api.episode"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"

const FlowEditorPage: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode,
}) => {
  const [syncState, setSyncState] = React.useState(SyncState.Synced)

  const titleChangeHandler = (title: string) => {
    setSyncState(SyncState.Waiting)
    debounce(async (title: string) => {
      setSyncState(SyncState.Syncing)
      await updateEpisode(episode.id, { title })
      setSyncState(SyncState.Synced)
    }, 1000)(title)
  }

  return (
    <FlowEditorTemplate
      episode={episode}
      onTitleChange={titleChangeHandler}
      syncState={syncState}
    />
  )
}

export default FlowEditorPage
