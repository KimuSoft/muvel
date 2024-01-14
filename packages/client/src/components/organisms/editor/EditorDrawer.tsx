import React, { useState } from "react"
import NovelProfile from "../../molecules/NovelProfile"
import { MdChevronLeft, MdMenu } from "react-icons/md"
import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  Hide,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import ExportEpisode from "../../molecules/editor/ExportEpisode"
import ImportEpisode from "../../molecules/editor/ImportEpisode"
import DeleteEpisode from "../DeleteEpisode"
import EditorSetting from "./EditorSetting"
import {
  Episode,
  EpisodeType,
  PartialEpisode,
} from "../../../types/episode.type"
import { api } from "../../../utils/api"
import { initialNovel, Novel } from "../../../types/novel.type"
import Auth from "../../molecules/Auth"
import ToggleColorModeButton from "../../atoms/ToggleColorModeButton"
import WidgetDrawer from "./WidgetDrawer"
import SearchModal from "../SearchModal"
import EpisodeItem from "../EpisodeItem"
import { NovelDetailPageSkeleton } from "../../pages/NovelDetailPage"
import { TbBook, TbCategory, TbPlus } from "react-icons/tb"

const EditorDrawer: React.FC<{ episode: PartialEpisode }> = ({ episode }) => {
  const [novel, setNovel] = useState<Novel>(initialNovel)
  const [loading, setLoading] = React.useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const navigate = useNavigate()

  const toast = useToast()

  const refreshNovel = async () => {
    setLoading(true)
    const { data } = await api.get<Novel>(`novels/${episode.novelId}`)
    setNovel(data)
    setLoading(false)
  }

  const addEpisode = async () => {
    if (!episode.novelId) return console.warn("업자나!!")
    setLoading(true)
    const { data } = await api.post<Episode>(
      `novels/${episode.novelId}/episodes`,
      {
        title: "새 에피소드",
        episodeType: EpisodeType.Episode,
      }
    )

    navigate(`/episodes/${data.id}`)
    toast({
      title: "새 에피소드를 생성했어요!",
      status: "success",
    })
    setLoading(false)
    refreshNovel().then()
  }

  const addChapter = async () => {
    setLoading(true)
    const { data } = await api.post<Episode>(
      `novels/${episode.novelId}/episodes`,
      {
        title: "새 챕터",
        episodeType: EpisodeType.EpisodeGroup,
      }
    )

    navigate(`/episodes/${data.id}`)

    toast({
      title: "새 챕터를 생성했어요!",
      description: "목록에서 드래그하여 챕터 위치를 바꿀 수 있어요",
      status: "success",
    })
    setLoading(false)
    refreshNovel().then()
  }

  const _onOpen = () => {
    refreshNovel().then()
    onOpen()
  }

  return (
    <>
      <IconButton
        aria-label={"menu"}
        icon={<MdMenu style={{ fontSize: 20 }} />}
        onClick={_onOpen}
        size={"sm"}
        variant={"ghost"}
      />

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent
          backgroundColor={useColorModeValue("gray.100", "gray.800")}
        >
          <DrawerCloseButton />
          <DrawerHeader>
            <Hide below={"md"}>
              <Button
                onClick={() => navigate(`/novels/${episode.novelId}`)}
                variant={"ghost"}
              >
                <MdChevronLeft size={24} style={{ marginRight: 10 }} />
                소설 페이지로 돌아가기
              </Button>
            </Hide>

            <Hide above={"md"}>
              <HStack w={"100%"}>
                <IconButton
                  aria-label={"back"}
                  icon={<MdChevronLeft size={24} />}
                  variant={"ghost"}
                  onClick={() => navigate(`/novels/${episode.novelId}`)}
                />
                <ToggleColorModeButton />
                <WidgetDrawer />
                <SearchModal novelId={novel.id} />
                <Auth />
              </HStack>
            </Hide>
          </DrawerHeader>
          <DrawerBody>
            <NovelProfile />
            <Divider mt={5} mb={10} />
            <HStack px={2}>
              <Heading fontSize="xl" mb={3}>
                에피소드 목록
              </Heading>
              <Spacer />
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label={"create"}
                  icon={<TbPlus />}
                  variant={"outline"}
                  size={"sm"}
                  colorScheme={"purple"}
                />
                <MenuList>
                  <MenuItem icon={<TbBook />} onClick={addEpisode}>
                    새 편 쓰기
                  </MenuItem>
                  <MenuItem onClick={addChapter} icon={<TbCategory />}>
                    새 카테고리 만들기
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>

            <VStack gap={1} py={5} alignItems={"baseline"}>
              {!loading ? (
                // TODO: 임시조치
                novel.episodes.map((episode, idx) => (
                  <EpisodeItem
                    episode={episode}
                    index={idx}
                    key={idx}
                    isDrawer={true}
                  />
                ))
              ) : (
                <>
                  <NovelDetailPageSkeleton />
                  <NovelDetailPageSkeleton />
                  <NovelDetailPageSkeleton />
                  <NovelDetailPageSkeleton />
                  <NovelDetailPageSkeleton />
                </>
              )}
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <HStack w="100%">
              <DeleteEpisode novel={novel} episodeId={episode.id} />
              <Spacer />
              <EditorSetting />
              <ExportEpisode />
              <ImportEpisode />
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default EditorDrawer
