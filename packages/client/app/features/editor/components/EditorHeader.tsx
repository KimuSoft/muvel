import React from "react"
import { HStack, IconButton, Spacer, type StackProps } from "@chakra-ui/react"
import OptionDrawer from "~/features/editor/components/drawers/OptionDrawer"
import { ColorModeButton } from "~/components/ui/color-mode"
import { FaChevronLeft } from "react-icons/fa"
import { useNavigate } from "react-router"
import { BiExport, BiHistory, BiSolidWidget } from "react-icons/bi"
import { FaList } from "react-icons/fa6"
import { Tooltip } from "~/components/ui/tooltip"
import EpisodeListDrawer from "~/features/editor/components/drawers/EpisodeListDrawer"
import WidgetDrawer from "~/features/editor/components/drawers/WidgetDrawer"
import SearchModal from "~/features/editor/components/SearchModal"
import type { GetEpisodeResponseDto } from "muvel-api-types"
import SyncIndicator, {
  SyncState,
} from "~/features/editor/components/SyncIndicator"
import { useUser } from "~/context/UserContext"
import CommentDrawer from "~/features/editor/components/drawers/CommentDrawer"
import { TbMessage } from "react-icons/tb"
import { ExportEpisodeDrawer } from "~/features/editor/components/drawers/ExportEpisodeDrawer"
import SnapshotDrawer from "~/features/editor/components/drawers/SnapshotDrawer"

const EditorHeader: React.FC<
  StackProps & {
    novelId: string
    episode: GetEpisodeResponseDto
    syncState: SyncState
  }
> = ({ novelId, episode, syncState, ...props }) => {
  const navigate = useNavigate()
  const user = useUser()

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

      <CommentDrawer episode={episode} editable={episode.permissions.edit}>
        <IconButton variant={"ghost"} size={"sm"}>
          <TbMessage />
        </IconButton>
      </CommentDrawer>

      {episode.permissions.edit && (
        <>
          <ExportEpisodeDrawer episode={episode}>
            <IconButton variant={"ghost"} size={"sm"}>
              <BiExport />
            </IconButton>
          </ExportEpisodeDrawer>
          <WidgetDrawer>
            <IconButton
              variant="ghost"
              aria-label="back"
              display={{ base: "none", md: "flex" }}
              size={"sm"}
            >
              <BiSolidWidget />
            </IconButton>
          </WidgetDrawer>
          <SnapshotDrawer episode={episode}>
            <IconButton variant="ghost" aria-label="back" size={"sm"}>
              <BiHistory />
            </IconButton>
          </SnapshotDrawer>
        </>
      )}
      <OptionDrawer />
      <ColorModeButton />
    </HStack>
  )
}

export default EditorHeader
