import { type Block, EpisodeType } from "muvel-api-types"
import React, { useMemo } from "react"
import NovelEditor from "~/features/novel-editor/components/NovelEditor"
import {
  Box,
  Button,
  Center,
  ClientOnly,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react"
import EditorHeader from "~/features/novel-editor/components/EditorHeader"
import MobileBar from "~/features/novel-editor/components/MobileBar"
import { WidgetPanel } from "~/features/novel-editor/widgets/containers/WidgetPanel"
import { useEditorStyleOptions, useWidgetLayout } from "~/hooks/useAppOptions"
import EpisodeTypeMenu from "~/features/novel-editor/components/menus/EpisodeTypeMenu"
import { usePlatform } from "~/hooks/usePlatform"
import { useEpisodeContext } from "~/providers/EpisodeProvider"
import EpisodeTitleInput from "~/features/novel-editor/components/EpisodeTitleInput"

const EditorTemplate: React.FC<{
  initialBlocks: Block[]
}> = ({ initialBlocks }) => {
  const { episode, updateEpisodeData } = useEpisodeContext()
  const [editorStyle] = useEditorStyleOptions()
  const { isMobile } = usePlatform()

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
      h={isMobile ? "100dvh" : undefined}
      overflowY={isMobile ? "scroll" : undefined}
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
        <EpisodeTitleInput
          color={editorStyle.color || undefined}
          fontFamily={editorStyle.fontFamily}
          defaultValue={episode.title}
          onValueChange={(title) => {
            updateEpisodeData((ep) => {
              ep.title = title
            })
          }}
          readOnly={!episode.permissions.edit}
        />
        {episode.description ? (
          <Text
            mt={1}
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
          />
        </ClientOnly>
      </Box>
      {isMobile && <MobileBar />}
    </VStack>
  )
}

export default EditorTemplate
