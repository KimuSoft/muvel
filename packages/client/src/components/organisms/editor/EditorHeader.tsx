import React from "react"
import EpisodeTitle from "../../atoms/editor/EpisodeTitle"
import Auth from "../../molecules/Auth"
import EditorDrawer from "./EditorDrawer"
import { Hide, HStack, Spinner, useColorModeValue } from "@chakra-ui/react"
import ToggleColorModeButton from "../../atoms/ToggleColorModeButton"
import SearchModal from "../SearchModal"
import {
  episodeState,
  isAutoSavingState,
  novelState,
} from "../../../recoil/editor"
import { useRecoilState } from "recoil"
import WidgetDrawer from "./WidgetDrawer"

const EditorHeader: React.FC = () => {
  const [novel] = useRecoilState(novelState)
  const [episode] = useRecoilState(episodeState)
  const [isAutoSaving] = useRecoilState(isAutoSavingState)

  return (
    <HStack
      position={"sticky"}
      top={0}
      w={"100%"}
      px={5}
      h="50px"
      zIndex={99}
      backgroundColor={useColorModeValue("white", "gray.900")}
      // 아래에 1px border
      borderBottom={"1px solid"}
      borderColor={useColorModeValue("gray.200", "gray.800")}
    >
      <Hide below={"md"}>
        <HStack w={200}>
          <EditorDrawer episode={episode} />
          {isAutoSaving && <Spinner flexShrink={0} />}
        </HStack>
      </Hide>
      <Hide above={"md"}>
        <HStack w={5}>
          <EditorDrawer episode={episode} />
          {isAutoSaving && <Spinner flexShrink={0} />}
        </HStack>
      </Hide>
      <EpisodeTitle />
      <Hide below={"md"}>
        <HStack w={200} flexDir={"row-reverse"} gap={1}>
          <Auth />
          <ToggleColorModeButton size={"sm"} mr={3} />
          <WidgetDrawer />
          <SearchModal novelId={novel.id} />
        </HStack>
      </Hide>
    </HStack>
  )
}

export default EditorHeader
