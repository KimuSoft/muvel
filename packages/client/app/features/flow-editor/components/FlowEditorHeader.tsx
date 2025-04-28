import { HStack, IconButton } from "@chakra-ui/react"
import EpisodeListDrawer from "~/features/novel-editor/components/drawers/EpisodeListDrawer"
import React from "react"
import type { GetEpisodeResponseDto } from "muvel-api-types"
import { FaList } from "react-icons/fa6"

const FlowEditorHeader: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode,
}) => {
  return (
    <HStack position={"fixed"} w={"100%"} top={0} left={0}>
      <EpisodeListDrawer
        novelId={episode.novelId}
        episodeId={episode.id}
        permissions={episode.permissions}
      >
        <IconButton size={"sm"}>
          <FaList />
        </IconButton>
      </EpisodeListDrawer>
    </HStack>
  )
}

export default FlowEditorHeader
