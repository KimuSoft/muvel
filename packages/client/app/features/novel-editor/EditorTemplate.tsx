import type { Block, GetEpisodeResponseDto } from "muvel-api-types"
import React, { useMemo } from "react"
import NovelEditor from "~/features/novel-editor/components/NovelEditor"
import {
  Box,
  Button,
  ClientOnly,
  Input,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useOption } from "~/context/OptionContext"
import EditorHeader from "~/features/novel-editor/components/EditorHeader"
import MobileBar from "~/features/novel-editor/components/MobileBar"
import { WidgetPanel } from "~/features/novel-editor/widgets/containers/WidgetPanel"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import { TextSelection } from "prosemirror-state"
import type { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import { useWidgetLayout } from "~/features/novel-editor/widgets/context/WidgetContext"

const EditorTemplate: React.FC<{
  episode: GetEpisodeResponseDto
  onBlocksChange: (blocks: Block[]) => void
  onTitleChange: (title: string) => void
  syncState: SyncState
}> = ({ episode, onBlocksChange, syncState, onTitleChange }) => {
  const { view } = useEditorContext()
  const [option] = useOption()

  // 제목 Input에서 Enter 키를 처리하는 핸들러
  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!view || event.key !== "Enter") return
    // 기본 Enter 동작 (예: 폼 제출) 방지
    event.preventDefault()

    // 1. ProseMirror 에디터 뷰에 포커스 설정
    view.focus()

    // 2. 에디터 문서의 시작 부분으로 커서 이동
    const { state, dispatch } = view
    // 문서 시작 부분으로 선택 영역 설정 (pos 1은 보통 첫 문단 시작)
    const startPosition = 1 // 0은 <doc> 바로 다음, 1은 보통 <p> 내부 시작
    const safePosition = Math.min(startPosition, state.doc.content.size) // 유효 범위 확인

    const selection = TextSelection.create(state.doc, safePosition)
    // 트랜잭션을 생성하여 선택 영역을 설정하고 해당 위치로 스크롤
    const tr = state.tr.setSelection(selection).scrollIntoView()
    dispatch(tr)
  }

  const { layout } = useWidgetLayout()

  const isWidgetUsing = useMemo(() => {
    return layout.left.length || layout.right.length
  }, [layout.left, layout.right])

  return (
    <VStack
      bgColor={option.backgroundColor || undefined}
      transition="background-color 0.2s ease-in-out"
      h={"dvh"}
      position={"relative"}
      alignItems={
        isWidgetUsing ? { base: "flex-start", xl: "center" } : "center"
      }
    >
      <ClientOnly>
        <WidgetPanel />
      </ClientOnly>
      <EditorHeader
        novelId={episode.novelId}
        episode={episode}
        transition="background-color 0.2s ease-in-out"
        bgColor={option.backgroundColor || { base: "white", _dark: "black" }}
        color={option.color || undefined}
        syncState={syncState}
      />
      <Box
        w={"100%"}
        maxW={option.editorMaxWidth}
        transition="max-width 0.2s ease-in-out"
        minH={"100%"}
        my={100}
        px={3}
      >
        <Button variant={"ghost"} color={"gray.500"} size={"md"}>
          {episode.order}편
        </Button>
        <Input
          key={episode.id + "-title"}
          fontSize={"2xl"}
          fontWeight={"bold"}
          color={option.color || undefined}
          border={"none"}
          _focus={{
            border: "none",
            outline: "none",
          }}
          px={4}
          placeholder={"제목을 입력해 주세요"}
          defaultValue={episode.title}
          onChange={(e) => {
            onTitleChange(e.target.value)
          }}
          onKeyDown={handleTitleKeyDown}
          readOnly={!episode.permissions.edit}
        />
        {episode.description ? (
          <Text
            px={4}
            mt={3}
            fontWeight={300}
            fontSize={"sm"}
            color={option.color || undefined}
            opacity={0.5}
          >
            {episode.description}
          </Text>
        ) : null}
        <Separator
          borderColor={option.color || undefined}
          opacity={0.5}
          mt={5}
          mb={3}
        />
        <ClientOnly>
          <NovelEditor
            key={episode.id}
            initialBlocks={episode.blocks}
            episodeId={episode.id}
            editable={episode.permissions.edit}
            onChange={onBlocksChange}
          />
        </ClientOnly>
      </Box>
      <MobileBar />
    </VStack>
  )
}

export default EditorTemplate
