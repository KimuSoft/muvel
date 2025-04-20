import {
  Button,
  CloseButton,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
  IconButton,
  Stack,
} from "@chakra-ui/react"
import { TbSettingsFilled } from "react-icons/tb"
import SortableEpisodeList from "~/components/organisms/SortableEpisodeList"
import React, { type PropsWithChildren, useEffect } from "react"
import { getNovel, updateNovelEpisodes } from "~/api/api.novel"
import type { GetNovelResponseDto } from "muvel-api-types"
import type { ReorderedEpisode } from "~/utils/reorderEpisode"

const OptionDrawer: React.FC<{ novelId: string } & PropsWithChildren> = ({
  novelId,
  children,
}) => {
  const [novel, setNovel] = React.useState<GetNovelResponseDto | null>(null)

  const fetchNovel = async () => {
    const novel = await getNovel(novelId)
    setNovel(novel)
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

  return (
    <DrawerRoot placement={"start"}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent>
          <DrawerCloseTrigger asChild>
            <CloseButton size="sm" position="absolute" top="4" right="4" />
          </DrawerCloseTrigger>
          <DrawerHeader>
            <DrawerTitle>에피소드 목록</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <Stack gap={3}>
              <SortableEpisodeList
                isNarrow
                episodes={novel?.episodes || []}
                onEpisodesChange={handleReorderEpisode}
              />
            </Stack>
          </DrawerBody>

          <DrawerFooter justifyContent="space-between"></DrawerFooter>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  )
}

export default OptionDrawer
