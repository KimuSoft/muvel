import React from "react"
import {
  HStack,
  IconButton,
  Spacer,
  Spinner,
  type StackProps,
} from "@chakra-ui/react"
import OptionDrawer from "~/features/editor/components/OptionDrawer"
import { ColorModeButton } from "~/components/ui/color-mode"
import { FaChevronLeft } from "react-icons/fa"
import { useNavigate } from "react-router"
import { BiSolidWidget } from "react-icons/bi"
import { FaList } from "react-icons/fa6"
import { Tooltip } from "~/components/ui/tooltip"
import EpisodeListDrawer from "~/features/editor/components/EpisodeListDrawer"
import WidgetDrawer from "~/features/editor/components/WidgetDrawer"
import SearchModal from "~/features/editor/components/SearchModal"
import type { GetEpisodeResponseDto } from "muvel-api-types"
import SyncIndicator, {
  SyncState,
} from "~/features/editor/components/SyncIndicator"

const EditorHeader: React.FC<
  StackProps & {
    novelId: string
    episode: GetEpisodeResponseDto
    syncState: SyncState
  }
> = ({ novelId, episode, syncState, ...props }) => {
  const navigate = useNavigate()

  return (
    <HStack
      position={"fixed"}
      top={0}
      left={0}
      px={5}
      w={"100%"}
      h={"70px"}
      zIndex={100}
      {...props}
    >
      <Tooltip content={"소설 페이지로 돌아가기"} openDelay={100} showArrow>
        <IconButton
          variant="ghost"
          aria-label="back"
          onClick={() => {
            navigate(`/novels/${novelId}`)
          }}
          size={"sm"}
        >
          <FaChevronLeft />
        </IconButton>
      </Tooltip>
      <EpisodeListDrawer
        novelId={novelId}
        episodeId={episode.id}
        permissions={episode.permissions}
      >
        <IconButton size={"sm"} variant="ghost" aria-label="back">
          <FaList />
        </IconButton>
      </EpisodeListDrawer>
      <SyncIndicator ml={3} state={syncState} />
      <Spacer />

      {episode.permissions.edit && <SearchModal novelId={novelId} />}

      {episode.permissions.edit && (
        <WidgetDrawer>
          <IconButton
            variant="ghost"
            aria-label="back"
            display={{ base: "none", xl: "flex" }}
          >
            <BiSolidWidget />
          </IconButton>
        </WidgetDrawer>
      )}
      <OptionDrawer />
      <ColorModeButton />
    </HStack>
  )
}

export default EditorHeader
