import React from "react"
import EpisodeTitle from "../../atoms/editor/EpisodeTitle"
import Auth from "../../molecules/Auth"
import EditorDrawer from "./EditorDrawer"
import { HStack, Spinner } from "@chakra-ui/react"
import ToggleColorModeButton from "../../atoms/ToggleColorModeButton"
import SearchModal from "../SearchModal"
import {
  episodeState,
  isAutoSavingState,
  novelState,
} from "../../../recoil/editor"
import { useRecoilState } from "recoil"

const EditorHeader: React.FC = () => {
  const [novel] = useRecoilState(novelState)
  const [episode] = useRecoilState(episodeState)
  const [isAutoSaving] = useRecoilState(isAutoSavingState)

  return (
    <HStack pl={10} pr={10} h="70px">
      <HStack w={200}>
        <EditorDrawer episode={episode} />
        {isAutoSaving && <Spinner flexShrink={0} />}
      </HStack>
      <EpisodeTitle />
      <HStack w={200} flexDir={"row-reverse"}>
        <Auth />
        <ToggleColorModeButton />
        <SearchModal novelId={novel.id} />
      </HStack>
    </HStack>
  )
}

export default EditorHeader
