import type { GetEpisodeResponseDto } from "muvel-api-types"
import React, { useCallback, useEffect } from "react"
import FlowEditorHeader from "~/features/flow-editor/components/FlowEditorHeader"
import { Box } from "@chakra-ui/react"
import "@xyflow/react/dist/style.css"
import {
  addEdge,
  Background,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  type OnConnect,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react"

const FlowEditor: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode,
}) => {
  const { screenToFlowPosition } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const onConnect: OnConnect = (params) =>
    setEdges((eds) => addEdge(params, eds))

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        setNodes((nds) => nds.filter((n) => !n.selected))
        setEdges((eds) => eds.filter((e) => !e.selected))
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setNodes, setEdges])

  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: crypto.randomUUID(),
        type: "default",
        position,
        data: { label: "새 노드" },
      }

      setNodes((nds) => [...nds, newNode])
    },
    [screenToFlowPosition, setNodes],
  )

  return (
    <Box w={"100vw"} h={"100vh"}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneDoubleClick} // 핸들러 연결
        onDoubleClick={() => console.log("더블클릭!")}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </Box>
  )
}

export default FlowEditor
