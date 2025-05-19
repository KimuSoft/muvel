import { type Block, EpisodeType } from "muvel-api-types"
import React, { useMemo } from "react"
import NovelEditor from "~/features/novel-editor/components/NovelEditor"
import {
  Box,
  Button,
  Center,
  ClientOnly,
  Input,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react"
import EditorHeader from "~/features/novel-editor/components/EditorHeader"
import MobileBar from "~/features/novel-editor/components/MobileBar"
import { WidgetPanel } from "~/features/novel-editor/widgets/containers/WidgetPanel"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import { TextSelection } from "prosemirror-state"
import type { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import { Node as PMNode } from "prosemirror-model"
import { useEditorStyleOptions, useWidgetLayout } from "~/hooks/useAppOptions"
import EpisodeTypeMenu from "~/features/novel-editor/components/menus/EpisodeTypeMenu"

const EditorTemplate: React.FC<{
  initialBlocks: Block[]
  onDocChange: (doc: PMNode) => void
  syncState: SyncState
}> = ({ onDocChange, syncState, initialBlocks }) => {
  const { view, episode, updateEpisodeData } = useEditorContext()
  const [editorStyle] = useEditorStyleOptions()

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

  const { widgetLayout } = useWidgetLayout()

  const isWidgetUsing = useMemo(() => {
    return widgetLayout.left.length || widgetLayout.right.length
  }, [widgetLayout.left, widgetLayout.right])

  const episodeCountText = useMemo(() => {
    if (episode.episodeType === EpisodeType.Episode) {
      return `${Math.round(parseFloat(episode.order.toString()))}편`
    } else if (episode.episodeType === EpisodeType.Prologue) {
      return "프롤로그"
    } else if (episode.episodeType === EpisodeType.Epilogue) {
      return "에필로그"
    } else if (episode.episodeType === EpisodeType.Special) {
      return "특별편"
    }
  }, [episode.episodeType, episode.order])

  return (
    <VStack
      bgColor={editorStyle.backgroundColor || undefined}
      minH={"100dvh"}
      transition="background-color 0.2s ease-in-out"
      position={"relative"}
      px={2}
      alignItems={
        isWidgetUsing
          ? { base: "center", md: "flex-start", xl: "center" }
          : "center"
      }
    >
      {episode.permissions.edit && (
        <ClientOnly>
          <WidgetPanel />
        </ClientOnly>
      )}
      <EditorHeader
        novelId={episode.novelId}
        episode={episode}
        transition="background-color 0.2s ease-in-out"
        bgColor={
          editorStyle.backgroundColor || { base: "white", _dark: "black" }
        }
        syncState={syncState}
      />
      <Box
        w={"100%"}
        maxW={editorStyle.editorMaxWidth}
        userSelect={episode.permissions.edit ? undefined : "none"}
        transition="max-width 0.2s ease-in-out"
        minH={"100%"}
        my={100}
        px={2}
        color={editorStyle.color || undefined}
        fontFamily={editorStyle.fontFamily}
      >
        <Center>
          <EpisodeTypeMenu
            episodeType={episode.episodeType}
            onSelect={(d) => {
              updateEpisodeData((e) => {
                e.episodeType = parseInt(d.value) as EpisodeType
              })
            }}
          >
            <Button variant={"ghost"} color={"gray.500"} size={"md"}>
              {episodeCountText}
            </Button>
          </EpisodeTypeMenu>
        </Center>
        <Input
          fontSize={"2xl"}
          fontWeight={"bold"}
          color={editorStyle.color || undefined}
          border={"none"}
          textAlign={"center"}
          fontFamily={editorStyle.fontFamily}
          _focus={{
            border: "none",
            outline: "none",
          }}
          px={4}
          placeholder={"제목을 입력해 주세요"}
          defaultValue={episode.title}
          onChange={(e) => {
            updateEpisodeData((ep) => {
              ep.title = e.target.value
            })
          }}
          onKeyDown={handleTitleKeyDown}
          readOnly={!episode.permissions.edit}
        />
        {episode.description ? (
          <Text
            mt={3}
            fontWeight={300}
            fontSize={"sm"}
            color={editorStyle.color || undefined}
            opacity={0.5}
            w={"100%"}
            textAlign={"center"}
          >
            {episode.description}
          </Text>
        ) : null}
        <Separator
          borderColor={editorStyle.color || undefined}
          opacity={0.7}
          mt={5}
          mb={7}
        />
        <ClientOnly>
          <NovelEditor
            key={episode.id}
            initialBlocks={initialBlocks}
            episodeId={episode.id}
            editable={episode.permissions.edit}
            onChange={onDocChange}
          />
        </ClientOnly>
      </Box>
      <MobileBar />
    </VStack>
  )
}

export default EditorTemplate
