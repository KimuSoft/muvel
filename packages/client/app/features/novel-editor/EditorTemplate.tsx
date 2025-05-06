import { type Block, EpisodeType } from "muvel-api-types"
import React, { useMemo } from "react"
import NovelEditor from "~/features/novel-editor/components/NovelEditor"
import {
  Box,
  Button,
  ClientOnly,
  Input,
  Menu,
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
import { FaBookOpen, FaStarOfLife } from "react-icons/fa6"
import { GoMoveToEnd, GoMoveToStart } from "react-icons/go"

const EditorTemplate: React.FC<{
  onBlocksChange: (blocks: Block[]) => void
  syncState: SyncState
  initialBlocks: Block[]
}> = ({ onBlocksChange, syncState, initialBlocks }) => {
  const { view, episode, updateEpisodeData } = useEditorContext()
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
      bgColor={option.backgroundColor || undefined}
      transition="background-color 0.2s ease-in-out"
      position={"relative"}
      alignItems={
        isWidgetUsing ? { base: "flex-start", xl: "center" } : "center"
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
        bgColor={option.backgroundColor || { base: "white", _dark: "black" }}
        color={option.color || undefined}
        syncState={syncState}
      />
      <Box
        w={"100%"}
        maxW={option.editorMaxWidth}
        userSelect={episode.permissions.edit ? undefined : "none"}
        transition="max-width 0.2s ease-in-out"
        minH={"100%"}
        my={100}
        px={2}
      >
        <Menu.Root
          onSelect={(d) => {
            updateEpisodeData((e) => {
              e.episodeType = parseInt(d.value) as EpisodeType
            })
          }}
        >
          <Menu.Trigger asChild>
            <Button variant={"ghost"} color={"gray.500"} size={"md"}>
              {episodeCountText}
            </Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              {episode.episodeType !== EpisodeType.Episode && (
                <Menu.Item value={EpisodeType.Episode.toString()}>
                  <FaBookOpen />
                  일반 회차로 지정
                </Menu.Item>
              )}
              {episode.episodeType !== EpisodeType.Prologue && (
                <Menu.Item value={EpisodeType.Prologue.toString()}>
                  <GoMoveToStart />
                  프롤로그로 지정
                </Menu.Item>
              )}
              {episode.episodeType !== EpisodeType.Epilogue && (
                <Menu.Item value={EpisodeType.Epilogue.toString()}>
                  <GoMoveToEnd />
                  에필로그로 지정
                </Menu.Item>
              )}
              {episode.episodeType !== EpisodeType.Special && (
                <Menu.Item value={EpisodeType.Special.toString()}>
                  <FaStarOfLife />
                  특별편으로 지정
                </Menu.Item>
              )}
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
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
            updateEpisodeData((ep) => {
              ep.title = e.target.value
            })
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
        <pre>{JSON.stringify(episode, null, 2)}</pre>
        <ClientOnly>
          <NovelEditor
            key={episode.id}
            episodeId={episode.id}
            initialBlocks={initialBlocks}
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
