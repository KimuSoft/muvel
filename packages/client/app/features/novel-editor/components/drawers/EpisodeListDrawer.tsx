import {
  CloseButton,
  Drawer,
  Heading,
  HStack,
  IconButton,
  type MenuSelectionDetails,
  Separator,
  Skeleton,
  Spacer,
  Stack,
} from "@chakra-ui/react"
import { TbPlus } from "react-icons/tb"
import SortableEpisodeList, {
  type SortDirection,
} from "~/components/organisms/SortableEpisodeList"
import React, { type PropsWithChildren } from "react"
import {
  type BasePermission,
  type EpisodeType,
  type GetNovelResponseDto,
  initialNovel,
} from "muvel-api-types"
import type { ReorderedEpisode } from "~/utils/reorderEpisode"
import { FaList } from "react-icons/fa6"
import NovelItem from "~/components/molecules/NovelItem"
import CreateEpisodeMenu from "~/features/novel-editor/components/menus/CreateEpisodeMenu"
import DeleteEpisodeDialog from "~/features/novel-editor/components/dialogs/DeleteEpisodeDialog"
import SortToggleButton from "~/components/atoms/SortToggleButton"
import EpisodeListLayoutToggleButton from "~/components/atoms/EpisodeListLayoutToggleButton"
import type { EpisodeItemVariant } from "~/components/molecules/EpisodeItem"
import { getNovel, updateNovelEpisodes } from "~/services/novelService"
import type { GetLocalNovelDetailsResponse } from "~/services/tauri/types"
import { createNovelEpisode } from "~/services/episodeService"
import { useNavigate } from "react-router"

const EpisodeListDrawer: React.FC<
  {
    novelId: string
    episodeId: string
    permissions: BasePermission
    isLocal?: boolean
  } & PropsWithChildren
> = ({ novelId, episodeId, permissions, children }) => {
  const [novel, setNovel] = React.useState<
    GetNovelResponseDto | GetLocalNovelDetailsResponse | null
  >(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")
  const [episodeListLayout, setEpisodeListLayout] =
    React.useState<EpisodeItemVariant>("shallow")

  const navigate = useNavigate()

  const fetchNovel = async () => {
    setIsLoading(true)
    const novel = await getNovel(novelId)
    setNovel(novel)
    setIsLoading(false)
  }

  const handleReorderEpisode = async (episodes: ReorderedEpisode[]) => {
    await updateNovelEpisodes(
      novelId,
      episodes
        .filter((e) => e.isReordered)
        .map((e) => ({ id: e.id, order: e.order })),
    )
    await fetchNovel()
  }

  const handleCreateEpisode = async (detail: MenuSelectionDetails) => {
    const episode = await createNovelEpisode(novelId, {
      episodeType: parseInt(detail.value) as EpisodeType,
    })
    navigate(`/episodes/${episode.id}`)
  }

  return (
    <Drawer.Root
      placement={"start"}
      size={"md"}
      onOpenChange={(open) => {
        if (open.open) void fetchNovel()
      }}
    >
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.CloseTrigger asChild>
            <CloseButton position="absolute" top="4" right="4" />
          </Drawer.CloseTrigger>
          <Drawer.Header></Drawer.Header>

          <Drawer.Body>
            <Stack gap={3}>
              <Skeleton loading={!novel}>
                <NovelItem novel={novel || initialNovel} />
              </Skeleton>
              <Separator my={3} />
              <HStack px={1}>
                <FaList />
                <Heading size={"md"} ml={1}>
                  에피소드 목록
                </Heading>
                <Spacer />

                <HStack gap={1}>
                  <EpisodeListLayoutToggleButton
                    variants={["shallow", "simple"]}
                    onValueChange={setEpisodeListLayout}
                    value={episodeListLayout}
                  />
                  <SortToggleButton
                    value={sortDirection}
                    onValueChange={setSortDirection}
                  />
                </HStack>
                {novel?.permissions.edit ? (
                  <CreateEpisodeMenu onSelect={handleCreateEpisode}>
                    <IconButton variant={"ghost"} gap={3}>
                      <TbPlus />
                    </IconButton>
                  </CreateEpisodeMenu>
                ) : null}
              </HStack>
              <SortableEpisodeList
                loading={isLoading}
                sortDirection={sortDirection}
                disableSort={!novel?.permissions.edit}
                variant={episodeListLayout}
                episodes={novel?.episodes || []}
                onEpisodesChange={handleReorderEpisode}
              />
            </Stack>
          </Drawer.Body>

          <Drawer.Footer justifyContent="space-between">
            {novel && permissions.delete && (
              <DeleteEpisodeDialog novel={novel} episodeId={episodeId} />
            )}
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  )
}

export default EpisodeListDrawer
