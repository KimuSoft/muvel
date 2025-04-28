import type { GetEpisodeResponseDto } from "muvel-api-types"
import React from "react"
import FlowEditorHeader from "~/features/flow-editor/components/FlowEditorHeader"
import "@xyflow/react/dist/style.css"
import FlowEditor from "~/features/flow-editor/components/FlowEditor"
import { ReactFlowProvider } from "@xyflow/react"
import type { SyncState } from "~/features/novel-editor/components/SyncIndicator"

const FlowEditorTemplate: React.FC<{
  episode: GetEpisodeResponseDto
  syncState: SyncState

  onTitleChange(title: string): void
}> = ({ episode, onTitleChange, syncState }) => {
  return (
    <>
      <FlowEditorHeader
        syncState={syncState}
        episode={episode}
        onTitleChange={onTitleChange}
      />
      <ReactFlowProvider>
        <FlowEditor episode={episode} />
      </ReactFlowProvider>
    </>
  )
}

export default FlowEditorTemplate
