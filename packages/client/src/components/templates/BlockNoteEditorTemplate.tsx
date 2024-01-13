import React from "react"
import { Block, BlockNoteEditor } from "@blocknote/core"
import { BlockNoteView, useBlockNote } from "@blocknote/react"
import "@blocknote/react/style.css"
import { useParams } from "react-router-dom"
import {
  Container,
  HStack,
  Spacer,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react"
import Header from "../organisms/Header"
import Logo from "../molecules/Logo"
import ToggleColorModeButton from "../atoms/ToggleColorModeButton"
import Auth from "../molecules/Auth"

const BlockNoteEditorTemplate: React.FC<{
  onEditorContentChange(blocks: BlockNoteEditor): unknown
}> = ({ onEditorContentChange }) => {
  // Hooks
  const episodeId = useParams<{ id: string }>().id || ""

  const editor: BlockNoteEditor = useBlockNote({
    onEditorContentChange: onEditorContentChange,
  })

  return (
    <VStack
      backgroundColor={useColorModeValue("#fff", "gray.900")}
      minH={"100vh"}
    >
      <HStack
        pl={10}
        pr={10}
        mb={10}
        h="70px"
        w={"100vw"}
        backgroundColor={useColorModeValue("gray.200", "gray.800")}
      >
        <Spacer />
        <ToggleColorModeButton />
        <Auth />
      </HStack>
      <Container w={"90%"} maxW={"2xl"}>
        <BlockNoteView
          editor={editor}
          theme={{
            light: {
              colors: {
                editor: {
                  background: "var(--chakra-colors-gray-100)",
                },
              },
              fontFamily:
                'KoPubWorldBatang, GowunBatang-Regular, "Noto Serif KR" ,sans-serif',
            },
            dark: {
              colors: {
                editor: {
                  background: "var(--chakra-colors-gray-900)",
                },
              },
              fontFamily:
                'KoPubWorldBatang, GowunBatang-Regular, "Noto Serif KR" ,sans-serif',
            },
          }}
        />
      </Container>
    </VStack>
  )
}

export default BlockNoteEditorTemplate
