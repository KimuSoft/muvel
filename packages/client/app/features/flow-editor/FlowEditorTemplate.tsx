import type { GetEpisodeResponseDto } from "muvel-api-types"
import React from "react"
import FlowEditorHeader from "~/features/flow-editor/components/FlowEditorHeader"
import { Box } from "@chakra-ui/react"
import "@xyflow/react/dist/style.css"
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  type OnConnect,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react"

const FlowEditorTemplate: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const onConnect: OnConnect = (params) =>
    setEdges((eds) => addEdge(params, eds))

  return (
    <>
      <FlowEditorHeader episode={episode} />
      <Box w={"100vw"} h={"100vh"}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </Box>
    </>
  )
}

export default FlowEditorTemplate
