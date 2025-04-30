import React from "react"
import {
  HStack,
  IconButton,
  Spacer,
  type StackProps,
  useDialog,
} from "@chakra-ui/react"
import EditorSettingDrawer from "~/features/novel-editor/components/drawers/OptionDrawer"
import { ColorModeButton } from "~/components/ui/color-mode"
import { useNavigate } from "react-router"
import { BiExport, BiHistory, BiSearch } from "react-icons/bi"
import { Tooltip } from "~/components/ui/tooltip"
import EpisodeListDrawer from "~/features/novel-editor/components/drawers/EpisodeListDrawer"
import WidgetDrawer from "~/features/novel-editor/components/drawers/WidgetDrawer"
import SearchDialog from "~/features/novel-editor/components/dialogs/SearchDialog"
import type { GetEpisodeResponseDto } from "muvel-api-types"
import SyncIndicator, {
  SyncState,
} from "~/features/novel-editor/components/SyncIndicator"
import CommentDrawer from "~/features/novel-editor/components/drawers/CommentDrawer"
import { TbChevronLeft, TbList, TbMessage } from "react-icons/tb"
import { ExportEpisodeDrawer } from "~/features/novel-editor/components/drawers/ExportEpisodeDrawer"
import SnapshotDrawer from "~/features/novel-editor/components/drawers/SnapshotDrawer"
import { MdOutlineWidgets } from "react-icons/md"
import MobileActionMenu from "~/features/novel-editor/components/menus/MobileActionMenu"
import { PiGear } from "react-icons/pi"

const EditorHeader: React.FC<
  StackProps & {
    novelId: string
    episode: GetEpisodeResponseDto
    syncState: SyncState
  }
> = ({ novelId, episode, syncState, ...props }) => {
  const navigate = useNavigate()

  const snapshotDialog = useDialog()
  const exportDialog = useDialog()
  const widgetDialog = useDialog()
  const commentDialog = useDialog()
  const settingDialog = useDialog()
  const searchDialog = useDialog()

  return (
    <HStack
      position={"fixed"}
      top={0}
      left={0}
      px={3}
      w={"100%"}
      py={2}
      zIndex={100}
      {...props}
    >
      <HStack gap={0}>
        <Tooltip content={"소설 페이지로 돌아가기"} openDelay={200}>
          <IconButton
            variant="ghost"
            aria-label="소설 페이지로 돌아가기"
            onClick={() => {
              navigate(`/novels/${novelId}`)
            }}
          >
            <TbChevronLeft />
          </IconButton>
        </Tooltip>
        <EpisodeListDrawer
          novelId={novelId}
          episodeId={episode.id}
          permissions={episode.permissions}
        >
          <IconButton aria-label="에피소드 목록 보기" variant="ghost">
            <TbList />
          </IconButton>
        </EpisodeListDrawer>
        <SyncIndicator ml={5} state={syncState} />
      </HStack>
      <Spacer />

      {/* Drawers */}
      <SnapshotDrawer episode={episode} dialog={snapshotDialog} />
      <ExportEpisodeDrawer episode={episode} dialog={exportDialog} />
      <WidgetDrawer dialog={widgetDialog} />
      <CommentDrawer
        episode={episode}
        editable={episode.permissions.edit}
        dialog={commentDialog}
      />
      <EditorSettingDrawer dialog={settingDialog} />
      <SearchDialog novelId={novelId} dialog={searchDialog} />

      <HStack gap={1} display={{ base: "none", md: "flex " }}>
        {episode.permissions.edit && (
          <>
            {/* 소설 검색하기 */}
            <Tooltip content={"소설 검색하기"} openDelay={200}>
              <IconButton
                aria-label="소설 검색하기"
                variant="ghost"
                onClick={() => searchDialog.setOpen(true)}
              >
                <BiSearch />
              </IconButton>
            </Tooltip>

            {/* 회차 내보내기 */}
            <Tooltip content={"회차 내보내기"} openDelay={200}>
              <IconButton
                aria-label="회차 내보내기"
                variant={"ghost"}
                onClick={() => exportDialog.setOpen(true)}
              >
                <BiExport />
              </IconButton>
            </Tooltip>

            {/* 위젯 설정하기 */}
            <Tooltip content={"위젯 설정하기"} openDelay={200}>
              <IconButton
                variant="ghost"
                aria-label="위젯 설정하기"
                display={{ base: "none", md: "flex" }}
                onClick={() => widgetDialog.setOpen(true)}
              >
                <MdOutlineWidgets />
              </IconButton>
            </Tooltip>

            {/* 버전 관리하기 */}
            <Tooltip content={"버전 관리하기"} openDelay={200}>
              <IconButton
                variant="ghost"
                aria-label="버전 관리하기"
                onClick={() => snapshotDialog.setOpen(true)}
              >
                <BiHistory />
              </IconButton>
            </Tooltip>
          </>
        )}

        {/* 리뷰 보기 */}
        <Tooltip content={"리뷰 보기"} openDelay={200}>
          <IconButton
            variant={"ghost"}
            aria-label="리뷰 보기"
            onClick={() => commentDialog.setOpen(true)}
          >
            <TbMessage />
          </IconButton>
        </Tooltip>

        {/* 에디터 설정하기 */}
        <Tooltip content={"에디터 설정하기"} openDelay={200}>
          <IconButton
            variant="ghost"
            aria-label="에디터 설정하기"
            onClick={() => settingDialog.setOpen(true)}
          >
            <PiGear />
          </IconButton>
        </Tooltip>

        {/* 컬러모드 전환하기 */}
        <ColorModeButton />
      </HStack>
      <MobileActionMenu
        searchDialog={searchDialog}
        commentDialog={commentDialog}
        exportDialog={exportDialog}
        snapshotDialog={snapshotDialog}
        settingDialog={settingDialog}
      />
    </HStack>
  )
}

export default EditorHeader
