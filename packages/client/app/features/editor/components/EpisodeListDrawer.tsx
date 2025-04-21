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
import { TbPlus } from "react-icons/tb"
import SortableEpisodeList from "~/components/organisms/SortableEpisodeList"
import React, { type PropsWithChildren, useEffect } from "react"
import {
  createNovelEpisode,
  getNovel,
  updateNovelEpisodes,
} from "~/api/api.novel"
import type { EpisodeType, GetNovelResponseDto } from "muvel-api-types"
import type { ReorderedEpisode } from "~/utils/reorderEpisode"
import { FaList } from "react-icons/fa6"
import NovelItem from "~/components/molecules/NovelItem"
import CreateEpisodeMenu from "~/features/editor/components/CreateEpisodeMenu"
import DeleteEpisodeDialog from "~/features/editor/components/DeleteEpisodeDialog"

const EpisodeListDrawer: React.FC<
  { novelId: string; episodeId: string } & PropsWithChildren
> = ({ novelId, episodeId, children }) => {
  const [novel, setNovel] = React.useState<GetNovelResponseDto | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchNovel = async () => {
    setIsLoading(true)
    const novel = await getNovel(novelId)
    setNovel(novel)
    setIsLoading(false)
  }

  useEffect(() => {
    void fetchNovel()
  }, [])

  const handleReorderEpisode = async (episodes: ReorderedEpisode[]) => {
    console.log("에피소드 정렬", episodes)
    await updateNovelEpisodes(
      novelId,
      episodes
        .filter((e) => e.isReordered)
        .map((e) => ({ id: e.id, order: e.order })),
    )
    await fetchNovel()
  }

  if (!novel) return null

  const handleCreateEpisode = async (detail: MenuSelectionDetails) => {
    await createNovelEpisode(novel.id, {
      episodeType: parseInt(detail.value) as EpisodeType,
    })
    void fetchNovel()
  }

  return (
    <DrawerRoot placement={"start"} size={"md"}>
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
              <HStack gap={3} px={1}>
                <FaList />
                <Heading size={"md"}>에피소드 목록</Heading>
                <Spacer />
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
                disableSort={!novel.permissions.edit}
                isNarrow
                episodes={novel?.episodes || []}
                onEpisodesChange={handleReorderEpisode}
              />
            </Stack>
          </DrawerBody>

          <DrawerFooter justifyContent="space-between">
            <DeleteEpisodeDialog novel={novel} episodeId={episodeId} />
          </DrawerFooter>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  )
}

export default EpisodeListDrawer
