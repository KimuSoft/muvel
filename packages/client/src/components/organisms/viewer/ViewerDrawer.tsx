import React, { useState } from "react"
import NovelProfile from "../../molecules/NovelProfile"
import EpisodeList from "../EpisodeList"
import EditorSetting from "../editor/EditorSetting"
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
  IconButton,
  useDisclosure,
} from "@chakra-ui/react"
import { MdChevronLeft, MdMenu } from "react-icons/md"
import { api } from "../../../utils/api"
import { initialNovel, Novel } from "../../../types/novel.type"
import { useNavigate } from "react-router-dom"

const ViewerDrawer: React.FC<{ novelId: string }> = ({ novelId }) => {
  const [novel, setNovel] = useState<Novel>(initialNovel)
  const [loading, setLoading] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const navigate = useNavigate()

  const refreshNovel = async () => {
    setLoading(true)
    const { data } = await api.get<Novel>(`novels/${novelId}`)
    setNovel(data)
    setLoading(false)
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
            <Button
              onClick={() => navigate(`/novels/${novelId}`)}
              variant={"ghost"}
            >
              <MdChevronLeft size={24} style={{ marginRight: 10 }} />
              소설 페이지로 돌아가기
            </Button>
          </DrawerHeader>
          <DrawerBody>
            <NovelProfile />
            <Divider mt={10} mb={10} />
            <Heading fontSize="xl" pl={4} mb={3}>
              에피소드 목록
            </Heading>
            <EpisodeList
              novel={novel}
              onChange={refreshNovel}
              isLoading={loading}
              disableSort
            />
          </DrawerBody>
          <DrawerFooter>
            <EditorSetting />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default ViewerDrawer
