import React from "react"
import EditorDrawer from "./EditorDrawer"
import { HStack, Spinner } from "@chakra-ui/react"
import WidgetDrawer from "./WidgetDrawer"
import { useBlockEditor } from "~/features/block-editor/context/EditorContext"
import { ColorModeButton } from "~/components/ui/color-mode"
import SearchModal from "../../../editor/components/SearchModal"
import EpisodeTitle from "~/features/block-editor/components/atoms/EpisodeTitle"
import Auth from "~/components/molecules/Auth"

const EditorHeader: React.FC = () => {
  const { novel, episode, isAutoSaving } = useBlockEditor()

  return (
    <HStack
      position={"sticky"}
      top={0}
      w={"100%"}
      px={5}
      h="50px"
      zIndex={99}
      backgroundColor={{ base: "white", _dark: "gray.900" }}
      // 아래에 1px border
      borderBottom={"1px solid"}
      borderColor={{ base: "gray.200", _dark: "gray.800" }}
    >
      <HStack w={200} display={{ base: "none", md: "flex" }}>
        <EditorDrawer episode={episode} />
        {isAutoSaving && <Spinner flexShrink={0} />}
      </HStack>
      <HStack w={5} display={{ base: "flex", md: "none" }}>
        <EditorDrawer episode={episode} />
        {isAutoSaving && <Spinner flexShrink={0} />}
      </HStack>
      <EpisodeTitle />
      <HStack
        w={200}
        flexDir={"row-reverse"}
        gap={1}
        display={{ base: "none", md: "flex" }}
      >
        <Auth />
        <ColorModeButton size={"sm"} mr={3} />
        <WidgetDrawer />
        <SearchModal novelId={novel.id} />
      </HStack>
    </HStack>
  )
}

export default EditorHeader
