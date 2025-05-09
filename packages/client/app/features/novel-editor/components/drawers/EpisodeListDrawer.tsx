import {
  CloseButton,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTrigger,
  Heading,
  HStack,
  IconButton,
  type MenuSelectionDetails,
  Separator,
  Spacer,
  Stack,
} from "@chakra-ui/react"
import { TbPlus, TbSortAscending, TbSortDescending } from "react-icons/tb"
import SortableEpisodeList, {
  type SortDirection,
} from "~/components/organisms/SortableEpisodeList"
import React, { type PropsWithChildren, useEffect } from "react"
import {
  createCloudNovelEpisode,
  getCloudNovel,
  updateCloudNovelEpisodes,
} from "~/services/api/api.novel"
import type {
  BasePermission,
  EpisodeType,
  GetNovelResponseDto,
} from "muvel-api-types"
import type { ReorderedEpisode } from "~/utils/reorderEpisode"
import { FaList } from "react-icons/fa6"
import NovelItem from "~/components/molecules/NovelItem"
import CreateEpisodeMenu from "~/features/novel-editor/components/menus/CreateEpisodeMenu"
import DeleteEpisodeDialog from "~/features/novel-editor/components/dialogs/DeleteEpisodeDialog"
import SortToggleButton from "~/components/atoms/SortToggleButton"
import EpisodeListLayoutToggleButton from "~/components/atoms/EpisodeListLayoutToggleButton"
import type { EpisodeItemVariant } from "~/components/molecules/EpisodeItem"

const EpisodeListDrawer: React.FC<
  {
    novelId: string
    episodeId: string
    permissions: BasePermission
  } & PropsWithChildren
> = ({ novelId, episodeId, permissions, children }) => {
  const [novel, setNovel] = React.useState<GetNovelResponseDto | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")
  const [episodeListLayout, setEpisodeListLayout] =
    React.useState<EpisodeItemVariant>("shallow")

  const fetchNovel = async () => {
    setIsLoading(true)
    const novel = await getCloudNovel(novelId)
    setNovel(novel)
    setIsLoading(false)
  }

  useEffect(() => {
    void fetchNovel()
  }, [])

  const handleReorderEpisode = async (episodes: ReorderedEpisode[]) => {
    await updateCloudNovelEpisodes(
      novelId,
      episodes
        .filter((e) => e.isReordered)
        .map((e) => ({ id: e.id, order: e.order })),
    )
    await fetchNovel()
  }

  if (!novel) return null

  const handleCreateEpisode = async (detail: MenuSelectionDetails) => {
    await createCloudNovelEpisode(novel.id, {
      episodeType: parseInt(detail.value) as EpisodeType,
    })
    void fetchNovel()
  }

  return (
    <DrawerRoot
      placement={"start"}
      size={"md"}
      onOpenChange={(open) => {
        if (open.open) void fetchNovel()
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent>
          <DrawerCloseTrigger asChild>
            <CloseButton position="absolute" top="4" right="4" />
          </DrawerCloseTrigger>
          <DrawerHeader></DrawerHeader>

          <DrawerBody>
            <Stack gap={3}>
              <NovelItem novel={novel} />
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
                {novel.permissions.edit ? (
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
                disableSort={!novel.permissions.edit}
                variant={episodeListLayout}
                episodes={novel?.episodes || []}
                onEpisodesChange={handleReorderEpisode}
              />
            </Stack>
          </DrawerBody>

          <DrawerFooter justifyContent="space-between">
            {permissions.delete && (
              <DeleteEpisodeDialog novel={novel} episodeId={episodeId} />
            )}
          </DrawerFooter>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  )
}

export default EpisodeListDrawer
