import React from "react"
import EpisodeTitle from "../../atoms/editor/EpisodeTitle"
import Auth from "../../molecules/Auth"
import EditorDrawer from "./EditorDrawer"
import { HStack, Spinner } from "@chakra-ui/react"
import ToggleColorModeButton from "../../atoms/ToggleColorModeButton"
import SearchModal from "../SearchModal"
import { isAutoSavingState, novelState } from "../../../recoil/editor"
import { useRecoilState } from "recoil"

const EditorHeader: React.FC = () => {
  const [novel] = useRecoilState(novelState)
  const [isAutoSaving] = useRecoilState(isAutoSavingState)

  return (
    <HStack pl={10} pr={10} h="70px">
      <EditorDrawer />
      {isAutoSaving && <Spinner flexShrink={0} />}
      <EpisodeTitle />
      <SearchModal novelId={novel.id} />
      <ToggleColorModeButton />
      <Auth />
    </HStack>
  )
}

export default EditorHeader
