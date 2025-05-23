import { HStack, IconButton, Input, Spacer } from "@chakra-ui/react"
import EpisodeListDrawer from "~/features/novel-editor/components/drawers/EpisodeListDrawer"
import React from "react"
import type { GetEpisodeResponseDto } from "muvel-api-types"
import { FaList } from "react-icons/fa6"
import { ColorModeButton } from "~/components/ui/color-mode"
import SyncIndicator, {
  type SyncState,
} from "~/features/novel-editor/components/SyncIndicator"
import { useEpisodeContext } from "~/providers/EpisodeProvider"

const FlowEditorHeader: React.FC = () => {
  const { episode, updateEpisodeData } = useEpisodeContext()

  return (
    <HStack
      position={"fixed"}
      w={"100%"}
      top={0}
      left={0}
      zIndex={100}
      px={5}
      p={2}
      bg={{
        base: "white",
        _dark: "black",
      }}
      boxShadow={"md"}
    >
      <EpisodeListDrawer
        novelId={episode.novelId}
        episode={episode}
        permissions={episode.permissions}
      >
        <IconButton size={"sm"} variant={"ghost"}>
          <FaList />
        </IconButton>
      </EpisodeListDrawer>
      <SyncIndicator />
      <Spacer />
      <Input
        defaultValue={episode.title}
        placeholder={"제목을 입력하세요"}
        onChange={(e) =>
          updateEpisodeData((draft) => {
            draft.title = e.target.value
          })
        }
      />
      <Spacer />
      <ColorModeButton size={"sm"} />
    </HStack>
  )
}

export default FlowEditorHeader
