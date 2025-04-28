import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ChangeEvent,
  type KeyboardEvent,
} from "react"
import {
  Handle,
  Position,
  useNodeId,
  useReactFlow,
  type NodeProps,
  type Node,
  NodeResizer,
} from "@xyflow/react"
import { Box, Input, Textarea } from "@chakra-ui/react"

// 데이터 타입 정의
export interface MemoNodeData {
  title: string
  description?: string
}

// 특정 노드 타입 정의 (인라인 객체 사용)
export type MemoNodeType = Node<
  {
    title: string
    description?: string
  },
  "memoNode"
>

const MemoNode: React.FC<NodeProps<MemoNodeType>> = ({
  data,
  id,
  selected,
  isConnectable,
}) => {
  const { setNodes } = useReactFlow()
  const nodeId = useNodeId()
  const [isHovered, setIsHovered] = useState(false)
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null)
  const [shouldFocusDescription, setShouldFocusDescription] = useState(false)

  // 스타일 정의
  const nodeBg = { base: "white", _dark: "black" }
  const nodeBorderColorBase = { base: "gray.300", _dark: "gray.700" }
  const nodeBorderColorSelected = { base: "purple.500", _dark: "purple.300" }
  const handleBgColor = "#8f31ce" // 핸들 배경색 (다크모드 별도 처리 필요시 수정)

  // 데이터 업데이트 로직
  const updateNodeData = useCallback(
    (newData: Partial<MemoNodeData>) => {
      if (!nodeId) return
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const updatedData = { ...node.data, ...newData }
            return { ...node, data: updatedData }
          }
          return node
        }),
      )
    },
    [nodeId, setNodes],
  )

  // 이벤트 핸들러
  const onTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateNodeData({ title: event.target.value })
    },
    [updateNodeData],
  )

  const onDescriptionChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData({ description: event.target.value })
    },
    [updateNodeData],
  )

  const onTitleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault()
        if (data?.description === undefined) {
          updateNodeData({ description: "" })
          setShouldFocusDescription(true)
        } else {
          // 설명 필드가 이미 있으면 거기로 포커스 이동 시도
          descriptionTextareaRef.current?.focus()
        }
      }
    },
    [data?.description, updateNodeData],
  )

  // 포커스 Effect
  useEffect(() => {
    if (shouldFocusDescription && descriptionTextareaRef.current) {
      descriptionTextareaRef.current.focus()
      setShouldFocusDescription(false)
    }
  }, [shouldFocusDescription])

  // 핸들 스타일
  const baseHandleStyle: React.CSSProperties = {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    opacity: isHovered || selected ? 1 : 0,
    transition: "opacity 0.1s ease-in-out",
    border: "none",
    backgroundColor: handleBgColor,
  }

  return (
    <>
      <NodeResizer
        minWidth={100}
        minHeight={data?.description !== undefined ? 150 : 30}
        color={handleBgColor}
        onResize={(event, { width, height }) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === id ? { ...node, width, height } : node,
            ),
          )
        }}
      />
      <Box
        bg={nodeBg}
        border="1px solid"
        borderColor={selected ? nodeBorderColorSelected : nodeBorderColorBase}
        boxShadow="sm"
        padding={2}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        w={"100%"}
        h={"100%"}
        overflow={"hidden"}
      >
        {/* 핸들 */}
        {/*<Handle*/}
        {/*  type="target" // 수정: 받기*/}
        {/*  position={Position.Top}*/}
        {/*  style={baseHandleStyle}*/}
        {/*  isConnectable={isConnectable}*/}
        {/*/>*/}
        <Handle
          type="source" // 유지: 빼기
          position={Position.Right}
          style={baseHandleStyle}
          isConnectable={isConnectable}
        />
        {/*<Handle*/}
        {/*  type="source" // 유지: 빼기*/}
        {/*  position={Position.Bottom}*/}
        {/*  style={baseHandleStyle}*/}
        {/*  isConnectable={isConnectable}*/}
        {/*/>*/}
        <Handle
          type="target" // 수정: 받기
          position={Position.Left}
          style={baseHandleStyle}
          isConnectable={isConnectable}
        />

        {/* 제목 Input */}
        <Input
          value={data?.title ?? ""}
          onChange={onTitleChange}
          onKeyDown={onTitleKeyDown}
          variant="subtle" // subtle variant 사용
          bg="none" // 배경 없음
          placeholder="제목..."
          fontSize="md"
          fontWeight="bold"
          autoFocus
          _focus={{
            border: "none",
            borderColor: "transparent",
          }}
        />
        {/* 설명 Textarea */}
        {data?.description !== undefined && (
          <Textarea
            ref={descriptionTextareaRef}
            value={data.description}
            onChange={onDescriptionChange}
            variant="subtle" // subtle variant 사용
            bg="none" // 배경 없음
            placeholder="설명..."
            fontSize="sm"
            w={"100%"}
            h={"calc(100% - 50px)"}
            resize="none"
          />
        )}
      </Box>
    </>
  )
}

export default React.memo(MemoNode)
