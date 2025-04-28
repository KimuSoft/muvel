import type { GetEpisodeResponseDto } from "muvel-api-types"
import React, { useCallback, useEffect, useRef } from "react"
import { Box, HStack, IconButton } from "@chakra-ui/react"
import "@xyflow/react/dist/style.css"
import {
  addEdge,
  Background,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  type OnConnect,
  type OnConnectEnd,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react"
import { FaNoteSticky } from "react-icons/fa6"
import { Tooltip } from "~/components/ui/tooltip"
import MemoNode, {
  type MemoNodeType,
} from "~/features/flow-editor/nodes/MemoNode"

const nodeTypes = {
  memoNode: MemoNode, // 'canvasNode' 라는 타입 이름으로 CanvasNode 컴포넌트 사용
}

const FlowEditor: React.FC<{
  doc?: { nodes: Node[]; edges: Edge[] }
  onChange(doc: { nodes: Node[]; edges: Edge[] }): void
}> = ({
  doc = {
    nodes: [],
    edges: [],
  },
  onChange,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null) // Ref 추가
  const { screenToFlowPosition } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(doc?.nodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(doc?.edges || [])

  const onConnect: OnConnect = (params) =>
    setEdges((eds) => addEdge(params, eds))

  useEffect(() => {
    console.log("변경!!!!")
    if (onChange) onChange({ nodes, edges })
  }, [nodes, edges])

  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event

        // 새 노드 정의 (MemoNodeType 사용)
        const newNode: MemoNodeType = {
          id: crypto.randomUUID(), // crypto.randomUUID() 사용 유지
          type: "memoNode", // 타입 변경
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: { title: "새 메모" }, // 데이터 구조 변경
          origin: [0.5, 0.0] as [number, number],
        }

        setNodes((nds) => [...nds, newNode])
        setEdges((eds) => [
          ...eds,
          {
            id: newNode.id,
            source: connectionState.fromNode!.id,
            target: newNode.id,
          },
        ])
      }
    },
    [screenToFlowPosition],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete") {
        setNodes((nds) => nds.filter((n) => !n.selected))
        setEdges((eds) => eds.filter((e) => !e.selected))
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setNodes, setEdges])

  const onCreateMemoNode = useCallback(
    () => {
      // event 파라미터 제거 (버튼 클릭 위치는 사용 안 함)
      if (!reactFlowWrapper.current) {
        console.error("React Flow wrapper ref not available")
        return
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()

      // React Flow div의 화면상 중앙 좌표 계산
      const centerX = reactFlowBounds.left + reactFlowBounds.width / 2
      const centerY = reactFlowBounds.top + reactFlowBounds.height / 2

      // 화면 중앙 좌표를 Flow 내부 좌표로 변환
      const position = screenToFlowPosition({
        x: centerX,
        y: centerY,
      })

      // 새 노드 정의 (MemoNodeType 사용)
      const newNode: MemoNodeType = {
        id: crypto.randomUUID(), // crypto.randomUUID() 사용 유지
        type: "memoNode", // 타입 변경
        position, // 계산된 중앙 위치 사용
        data: { title: "새 메모" }, // 데이터 구조 변경
      }

      setNodes((nds) => [...nds, newNode])
    },
    [screenToFlowPosition, setNodes], // 의존성 배열 업데이트
  )

  return (
    <Box w={"100vw"} h={"100vh"} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnectEnd={onConnectEnd}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
      <HStack
        position={"fixed"}
        left={"50vw"}
        bottom={10}
        borderRadius={"md"}
        bg={{ base: "white", _dark: "black" }}
        p={2}
        boxShadow={"md"}
        zIndex={100}
      >
        <Tooltip content={"메모 노드 추가하기"} openDelay={0}>
          <IconButton variant={"ghost"} size={"lg"} onClick={onCreateMemoNode}>
            <FaNoteSticky />
          </IconButton>
        </Tooltip>
      </HStack>
    </Box>
  )
}

export default FlowEditor
