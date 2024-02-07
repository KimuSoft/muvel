import React, { ReactNode, useState } from "react"
import EditorHeader from "../../organisms/editor/EditorHeader"
import MuvelBlockEditor from "../../organisms/editor/MuvelBlockEditor"
import { Widgets } from "./styles"
import EditorSkeleton from "./EditorSkeleton"
import MarkdownEditor from "../../organisms/editor/MarkdownEditor"
import {
  Container,
  Text,
  Textarea,
  useColorModeValue,
  useMediaQuery,
  VStack,
} from "@chakra-ui/react"
import { Episode, PartialEpisode } from "../../../types/episode.type"

export enum EditorType {
  MuvelBlock,
  Markdown,
}

const EditorTemplate: React.FC<{
  isLoading: boolean
  editorType: EditorType
  widgets: ReactNode[]
  episode: PartialEpisode
  onEpisodeDescriptionChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void
}> = ({
  isLoading,
  editorType,
  widgets,
  onEpisodeDescriptionChange,
  episode,
}) => {
  const [isPC] = useMediaQuery("(min-width: 800px)")

  return (
    <VStack
      minH={"100vh"}
      w={"100vw"}
      backgroundColor={useColorModeValue("#fff", "gray.900")}
    >
      <EditorHeader />
      <Container px={0} w={isPC ? "80%" : "100%"} maxW={"3xl"} my={30}>
        {!isLoading ? (
          editorType === EditorType.MuvelBlock ? (
            <Container maxW="3xl" id={"editor-container"}>
              <Text color="gray.500" mb={3} fontSize={"sm"} userSelect={"none"}>
                에피소드 설명
              </Text>
              <Textarea
                defaultValue={episode.description}
                bgColor={useColorModeValue("gray.200", "gray.800")}
                border="none"
                _focus={{ border: "none" }}
                mb={10}
                onChange={onEpisodeDescriptionChange}
              />
              <Text color="gray.500" mb={3} fontSize={"sm"} userSelect={"none"}>
                본문
              </Text>
              <MuvelBlockEditor />
            </Container>
          ) : (
            <MarkdownEditor />
          )
        ) : (
          <EditorSkeleton />
        )}
      </Container>
      <Widgets>{widgets}</Widgets>
    </VStack>
  )
}

export default EditorTemplate
