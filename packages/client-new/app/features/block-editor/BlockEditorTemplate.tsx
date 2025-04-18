import React, { type ReactNode } from "react"
import { Container, Flex, Text, Textarea, VStack } from "@chakra-ui/react"
import type { PartialEpisode } from "~/types/episode.type"
import EditorHeader from "~/features/block-editor/components/organisms/EditorHeader"
import MuvelBlockEditor from "~/features/block-editor/components/organisms/MuvelBlockEditor"

const BlockEditorTemplate: React.FC<{
  widgets: ReactNode[]
  episode: PartialEpisode
  onEpisodeDescriptionChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void
}> = ({ widgets, onEpisodeDescriptionChange, episode }) => {
  return (
    <VStack
      minH={"100vh"}
      w={"100vw"}
      backgroundColor={{ base: "#fff", _dark: "gray.900" }}
    >
      <EditorHeader />
      <Container px={0} w={{ base: "100%", md: "80%" }} maxW={"3xl"} my={30}>
        <Container maxW="3xl" id={"editor-container"}>
          <Text color="gray.500" mb={3} fontSize={"sm"} userSelect={"none"}>
            에피소드 설명
          </Text>
          <Textarea
            defaultValue={episode.description}
            bgColor={{ base: "gray.800", md: "gray.200" }}
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
      </Container>
      <Flex
        position={"fixed"}
        display={{ base: "none", md: "flex" }}
        bottom={0}
        right={0}
        flexDir={"column-reverse"}
        alignItems={"center"}
        gap={"10px"}
        padding={"0 30px 30px 0"}
        width={"300px"}
        height={"calc(100vh - 80px)"}
      >
        {widgets}
      </Flex>
    </VStack>
  )
}

export default BlockEditorTemplate
