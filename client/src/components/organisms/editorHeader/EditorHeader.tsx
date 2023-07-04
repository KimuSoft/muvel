import React, { useContext } from "react"
import EpisodeTitle from "../../atoms/EpisodeTitle"
import Auth from "../../molecules/Auth"
import EditorContext from "../../../context/EditorContext"
import Sidebar from "../sidebar"
import { HStack, Spinner } from "@chakra-ui/react"
import ToggleColorModeButton from "../../atoms/ToggleColorModeButton"
import SearchModal from "../SearchModal"

const EditorHeader: React.FC = () => {
  const { isSaving, novel } = useContext(EditorContext)

  return (
    <HStack pl={10} pr={10} h="70px">
      <Sidebar />
      {isSaving && <Spinner />}
      <EpisodeTitle />
      <SearchModal novelId={novel.id} />
      <ToggleColorModeButton />
      <Auth />
    </HStack>
  )
}

export default EditorHeader
