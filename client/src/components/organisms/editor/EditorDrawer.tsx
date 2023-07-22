import React, { useContext } from "react"
import NovelProfile from "../../molecules/NovelProfile"
import IconButton from "../../atoms/IconButton"
import { MdChevronLeft, MdMenu } from "react-icons/md"
import EditorContext from "../../../context/EditorContext"
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
import { useRecoilState } from "recoil"
import { episodeState, novelState } from "../../../recoil/editor"
import { Episode, EpisodeType } from "../../../types/episode.type"
import { api } from "../../../utils/api"
import { HiOutlineRectangleGroup } from "react-icons/hi2"
import { FaFeatherAlt } from "react-icons/fa"

const EditorDrawer: React.FC = () => {
  const [novel] = useRecoilState(novelState)
  const [episode] = useRecoilState(episodeState)

  const { refreshNovel } = useContext(EditorContext)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)

  const toast = useToast()

  const addEpisode = async () => {
    setLoading(true)
    const { data } = await api.post<Episode>(`novels/${novel.id}/episodes`, {
      title: "새 에피소드",
      episodeType: EpisodeType.Episode,
    })

    navigate(`/episodes/${data.id}`)
    toast({
      title: "새 에피소드를 생성했어요!",
      status: "success",
    })
    setLoading(false)
  }

  const addChapter = async () => {
    setLoading(true)
    const { data } = await api.post<Episode>(`novels/${novel.id}/episodes`, {
      title: "새 챕터",
      episodeType: EpisodeType.EpisodeGroup,
    })

    navigate(`/episodes/${data.id}`)
    toast({
      title:
        "새 챕터를 생성했어요! (챕터 내 블록 편집 기능은 비활성화될 예정입니다)",
      status: "success",
    })
    setLoading(false)
  }

  return (
    <>
      <IconButton onClick={onOpen} style={{ backgroundColor: "transparent" }}>
        <MdMenu style={{ fontSize: 24 }} />
      </IconButton>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <IconButton
              onClick={() => navigate(`/novels/${novel.id}`)}
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
            <EpisodeList novel={novel} refresh={refreshNovel} />
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
