import React from "react"
import EpisodeTitle from "../../atoms/editor/EpisodeTitle"
import Auth from "../../molecules/Auth"
import { HStack } from "@chakra-ui/react"
import ToggleColorModeButton from "../../atoms/ToggleColorModeButton"
import { novelState } from "../../../recoil/editor"
import { useRecoilState } from "recoil"
import ViewerDrawer from "./ViewerDrawer"

const ViewerHeader: React.FC = () => {
  const [novel] = useRecoilState(novelState)

  return (
    <HStack w="100%" pl={10} pr={10} h="70px">
      <HStack w={200}>
        <ViewerDrawer novelId={novel.id} />
      </HStack>
      <EpisodeTitle disabled={true} />
      <HStack w={200} flexDir={"row-reverse"}>
        <Auth />
        <ToggleColorModeButton />
        {/*<SearchModal novelId={novel.id} />*/}
      </HStack>
    </HStack>
  )
}

export default ViewerHeader
