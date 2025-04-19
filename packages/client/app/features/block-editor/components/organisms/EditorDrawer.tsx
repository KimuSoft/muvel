import React, { useEffect, useState } from "react"
import {
  Button,
  CloseButton,
  Drawer,
  Heading,
  HStack,
  IconButton,
  Menu,
  Portal,
  Separator,
  Spacer,
} from "@chakra-ui/react"
import { useNavigate } from "react-router"
import EditorSetting from "./EditorSetting"
import {
  type Episode,
  EpisodeType,
  type GetNovelResponseDto,
} from "muvel-api-types"
import { api } from "~/utils/api"
import { initialNovel, type Novel } from "muvel-api-types"
import Auth from "~/components/molecules/Auth"
import WidgetDrawer from "./WidgetDrawer"
import { TbBook, TbCategory, TbChevronLeft, TbPlus } from "react-icons/tb"
import { toaster } from "~/components/ui/toaster"
import { ColorModeButton } from "~/components/ui/color-mode"
import SearchModal from "../modals/SearchModal"
import NovelProfile from "../molecules/NovelProfile"
import SortableEpisodeList from "~/components/organisms/SortableEpisodeList"
import ExportEpisode from "../molecules/ExportEpisode"
import DeleteEpisodeDialog from "../modals/DeleteEpisodeDialog"
import ImportEpisode from "~/features/block-editor/components/molecules/ImportEpisode"
import { MdChevronLeft, MdMenu } from "react-icons/md"
import { getNovel } from "~/api/api.novel"

const EditorDrawer: React.FC<{ episode: Episode }> = ({ episode }) => {
  const [novel, setNovel] = useState<GetNovelResponseDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const navigate = useNavigate()

  const refreshNovel = async () => {
    setLoading(true)
    const novel = await getNovel(episode.novelId)
    setNovel(novel)
    setLoading(false)
  }

  useEffect(() => {
    if (open) void refreshNovel()
  }, [open])

  const addEpisode = async () => {
    if (!episode.novelId) return console.warn("업자나!!")
    setLoading(true)
    const { data } = await api.post<Episode>(
      `novels/${episode.novelId}/episodes`,
      {
        title: "새 에피소드",
        episodeType: EpisodeType.Episode,
      },
    )

    navigate(`/episodes/${data.id}`)
    toaster.success({ title: "새 에피소드를 생성했어요!" })
    setLoading(false)
    void refreshNovel()
  }

  const addChapter = async () => {
    setLoading(true)
    const { data } = await api.post<Episode>(
      `novels/${episode.novelId}/episodes`,
      {
        title: "새 챕터",
        episodeType: EpisodeType.EpisodeGroup,
      },
    )

    navigate(`/episodes/${data.id}`)
    toaster.success({
      title: "새 챕터를 생성했어요!",
      description: "목록에서 드래그하여 챕터 위치를 바꿀 수 있어요",
    })
    setLoading(false)
    void refreshNovel()
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(value) => setOpen(value.open)}
      placement="start"
      size={"lg"}
    >
      <Drawer.Trigger asChild>
        <IconButton aria-label="menu" size="sm" variant="ghost">
          <MdMenu style={{ fontSize: 20 }} />
        </IconButton>
      </Drawer.Trigger>

      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg={{ base: "gray.100", _dark: "gray.800" }}>
            <Drawer.Header>
              <HStack justify="space-between" align="center" w="100%">
                <Button
                  onClick={() => navigate(`/novels/${episode.novelId}`)}
                  variant="ghost"
                  size="sm"
                  display={{ base: "none", md: "flex" }}
                >
                  <TbChevronLeft size={20} style={{ marginRight: 10 }} />
                  소설 페이지로 돌아가기
                </Button>

                <Drawer.CloseTrigger asChild>
                  <CloseButton />
                </Drawer.CloseTrigger>
              </HStack>

              <HStack w="100%" display={{ base: "flex", md: "none" }} mt={2}>
                <IconButton
                  aria-label="back"
                  variant="ghost"
                  onClick={() => navigate(`/novels/${episode.novelId}`)}
                >
                  <MdChevronLeft size={24} />
                </IconButton>
                <ColorModeButton />
                <WidgetDrawer />
                {novel && <SearchModal novelId={novel.id} />}
                <Auth />
              </HStack>
            </Drawer.Header>

            <Drawer.Body>
              <NovelProfile />
              <Separator mt={5} mb={10} />
              <HStack px={2}>
                <Heading fontSize="xl" mb={3}>
                  에피소드 목록
                </Heading>
                <Spacer />
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <IconButton
                      aria-label="create"
                      variant="outline"
                      size="sm"
                      colorScheme="purple"
                    >
                      <TbPlus />
                    </IconButton>
                  </Menu.Trigger>

                  <Menu.Content>
                    <Menu.Item value="write" onClick={addEpisode}>
                      <TbBook /> 새 편 쓰기
                    </Menu.Item>
                    <Menu.Item value="category" onClick={addChapter}>
                      <TbCategory /> 새 카테고리 만들기
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Root>
              </HStack>

              <SortableEpisodeList
                episodes={novel?.episodes || []}
                isLoading={loading}
                isNarrow
              />
            </Drawer.Body>

            <Drawer.Footer>
              <HStack w="100%">
                {novel && (
                  <DeleteEpisodeDialog novel={novel} episodeId={episode.id} />
                )}
                <Spacer />
                <EditorSetting />
                <ExportEpisode />
                <ImportEpisode />
              </HStack>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}

export default EditorDrawer
