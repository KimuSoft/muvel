import React, { useState } from "react"
import NovelProfile from "../../molecules/NovelProfile"
import { MdChevronLeft, MdMenu } from "react-icons/md"
import EpisodeList from "../EpisodeList"
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
  Spacer,
  Tooltip,
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
import { HiOutlineRectangleGroup } from "react-icons/hi2"
import { FaFeatherAlt } from "react-icons/fa"
import { initialNovel, Novel } from "../../../types/novel.type"
import Auth from "../../molecules/Auth"
import ToggleColorModeButton from "../../atoms/ToggleColorModeButton"
import WidgetDrawer from "./WidgetDrawer"
import SearchModal from "../SearchModal"

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
        icon={<MdMenu style={{ fontSize: 24 }} />}
        onClick={_onOpen}
        variant={"ghost"}
      />

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
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
            <HStack w="100%" mt={3}>
              <Spacer />
              <Tooltip
                label={
                  "새 챕터를 추가한 후, 목록에서 드래그하여 순서를 변경할 수 있어요!"
                }
                openDelay={500}
              >
                <Button
                  colorScheme={"gray"}
                  isLoading={loading}
                  onClick={addChapter}
                >
                  <HiOutlineRectangleGroup style={{ marginRight: 10 }} />새 챕터
                  생성
                </Button>
              </Tooltip>
              <Button
                colorScheme={"purple"}
                isLoading={loading}
                onClick={addEpisode}
              >
                <FaFeatherAlt style={{ marginRight: 10 }} />새 편 쓰기
              </Button>
            </HStack>
            <Divider mt={5} mb={10} />
            <Heading fontSize="xl" pl={4} mb={3}>
              에피소드 목록
            </Heading>
            <EpisodeList
              novel={novel}
              onChange={refreshNovel}
              isLoading={loading}
            />
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
