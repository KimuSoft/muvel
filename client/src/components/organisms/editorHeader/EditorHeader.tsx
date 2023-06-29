import React, { useContext } from "react"
import EpisodeTitle from "../../atoms/EpisodeTitle"
import Auth from "../../molecules/Auth"
import EditorContext from "../../../context/EditorContext"
import Sidebar from "../sidebar"
import { HStack } from "@chakra-ui/react"
import ToggleColorModeButton from "../../atoms/ToggleColorModeButton"
import Loading from "../../atoms/Loading"

const EditorHeader: React.FC = () => {
  const { isSaving } = useContext(EditorContext)

  return (
    <HStack pl={10} pr={10} h="70px">
      <Sidebar />
      {isSaving && <Loading />}
      <EpisodeTitle />
      <Auth />
      <ToggleColorModeButton />
    </HStack>
  )
}

export default EditorHeader
