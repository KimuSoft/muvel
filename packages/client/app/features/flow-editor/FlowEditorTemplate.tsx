import React from "react"
import FlowEditorHeader from "~/features/flow-editor/components/FlowEditorHeader"
import "@xyflow/react/dist/style.css"
import FlowEditor from "~/features/flow-editor/components/FlowEditor"
import { ReactFlowProvider } from "@xyflow/react"

const FlowEditorTemplate: React.FC = () => {
  return (
    <>
      <FlowEditorHeader />
      <ReactFlowProvider>
        <FlowEditor />
      </ReactFlowProvider>
    </>
  )
}

export default FlowEditorTemplate
