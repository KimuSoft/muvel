import React, { ReactNode } from "react"
import EditorHeader from "../../organisms/editor/EditorHeader"
import MuvelBlockEditor from "../../organisms/editor/MuvelBlockEditor"
import { Body, MainStyle, Widgets } from "./styles"
import EditorSkeleton from "./EditorSkeleton"
import MarkdownEditor from "../../organisms/editor/MarkdownEditor"
import { Container, useColorModeValue, VStack } from "@chakra-ui/react"

export enum EditorType {
  MuvelBlock,
  Markdown,
}

const EditorTemplate: React.FC<{
  isLoading: boolean
  editorType: EditorType
  widgets: ReactNode[]
}> = ({ isLoading, editorType, widgets }) => {
  return (
    <VStack
      minH={"100vh"}
      w={"100vw"}
      backgroundColor={useColorModeValue("#fff", "gray.900")}
    >
      <EditorHeader />
      <Container w={"80%"} maxW={"3xl"} my={30}>
        {!isLoading ? (
          editorType === EditorType.MuvelBlock ? (
            <MuvelBlockEditor />
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
