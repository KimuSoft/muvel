import type { Block, GetEpisodeResponseDto } from "muvel-api-types"
import React from "react"
import NovelEditor from "~/features/editor/components/NovelEditor"
import {
  Button,
  ClientOnly,
  Container,
  Input,
  Separator,
  VStack,
} from "@chakra-ui/react"
import { useOption } from "~/context/OptionContext"
import EditorHeader from "~/features/editor/components/EditorHeader"
import MobileBar from "~/features/editor/components/MobileBar"
import { WidgetPanel } from "~/features/editor/widgets/containers/WidgetPanel"

const EditorTemplate: React.FC<{
  episode: GetEpisodeResponseDto
  onBlocksChange: (blocks: Block[]) => void
  onTitleChange: (title: string) => void
  isAutoSaving: boolean
}> = ({ episode, onBlocksChange, isAutoSaving, onTitleChange }) => {
  // const { view, getBlocks } = useEditorContext()
  const [option] = useOption()

  return (
    <VStack
      bgColor={option.backgroundColor || undefined}
      transition="background-color 0.2s ease-in-out"
      minH={"100vh"}
      h={"100%"}
      position={"relative"}
    >
      <ClientOnly>
        <WidgetPanel />
      </ClientOnly>
      <EditorHeader
        novelId={episode.novelId}
        episodeId={episode.id}
        transition="background-color 0.2s ease-in-out"
        bgColor={option.backgroundColor || { base: "white", _dark: "black" }}
        color={option.color || undefined}
        isAutoSaving={isAutoSaving}
      />
      <Container
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
        />
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
      </Container>
      <MobileBar />
    </VStack>
  )
}

export default EditorTemplate
