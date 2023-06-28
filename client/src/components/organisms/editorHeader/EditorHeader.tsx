import React, { useContext } from "react"
import EpisodeTitle from "../../atoms/EpisodeTitle"
import Auth from "./Auth"
import EditorContext from "../../../context/EditorContext"
import Sidebar from "../sidebar"
import { HStack } from "@chakra-ui/react"
import ToggleColorModeButton from "../../atoms/ToggleColorModeButton"
import { AiOutlineLoading3Quarters } from "react-icons/ai"

const EditorHeader: React.FC = () => {
  const { isSaving } = useContext(EditorContext)

  return (
    <HStack pl={10} pr={10} h="70px">
      <Sidebar />
      {isSaving && <AiOutlineLoading3Quarters size={32} />}
      <EpisodeTitle />
      <Auth />
      <ToggleColorModeButton />
    </HStack>
  )
}

export default EditorHeader
