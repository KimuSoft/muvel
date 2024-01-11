import React from "react"
import EpisodeTitle from "../../atoms/editor/EpisodeTitle"
import Auth from "../../molecules/Auth"
import EditorDrawer from "./EditorDrawer"
import { Hide, HStack, Spinner } from "@chakra-ui/react"
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
    <HStack px={8} h="70px">
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
        <HStack w={200} flexDir={"row-reverse"}>
          <Auth />
          <ToggleColorModeButton />
          <WidgetDrawer />
          <SearchModal novelId={novel.id} />
        </HStack>
      </Hide>
    </HStack>
  )
}

export default EditorHeader
