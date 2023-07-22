import React, { useState } from "react"
import NovelProfile from "../../molecules/NovelProfile"
import IconButton from "../../atoms/IconButton"
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
  HStack,
  Spacer,
  Tooltip,
  useDisclosure,
  useToast,
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
      title:
        "새 챕터를 생성했어요! (챕터 내 블록 편집 기능은 비활성화될 예정입니다)",
      status: "success",
    })
    setLoading(false)
  }

  const _onOpen = () => {
    refreshNovel().then()
    onOpen()
  }

  return (
    <>
      <IconButton onClick={_onOpen} style={{ backgroundColor: "transparent" }}>
        <MdMenu style={{ fontSize: 24 }} />
      </IconButton>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <IconButton
              onClick={() => navigate(`/novels/${episode.novelId}`)}
              text={"소설 페이지로 돌아가기"}
              style={{ backgroundColor: "transparent", marginRight: "auto" }}
            >
              <MdChevronLeft />
            </IconButton>
          </DrawerHeader>
          <DrawerBody>
            <NovelProfile />
            <HStack w="100%">
              <Spacer />
              <Tooltip
                label={"(미완성) 챕터 내 블록 편집 기능은 비활성될 예정입니다."}
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
            <Divider mt={10} mb={10} />
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
