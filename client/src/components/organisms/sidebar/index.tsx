import React, { useContext } from "react"
import NovelProfile from "../../molecules/NovelProfile"
import IconButton from "../../atoms/IconButton"
import { MdChevronLeft, MdMenu } from "react-icons/md"
import EditorContext from "../../../context/EditorContext"
import EpisodeList from "../EpisodeList"
import {
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
  useDisclosure,
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import ExportButton from "../../molecules/ExportButton"
import ImportButton from "../../molecules/ImportButton"
import DeleteEpisode from "../DeleteEpisode"

const Sidebar: React.FC = () => {
  const { novel, episode } = useContext(EditorContext)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const navigate = useNavigate()

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
            <Divider mt={10} mb={10} />
            <Heading fontSize="xl" pl={4} mb={3}>
              에피소드 목록
            </Heading>
            <EpisodeList novel={novel} />
          </DrawerBody>
          <DrawerFooter>
            <HStack w="100%">
              <DeleteEpisode novel={novel} episodeId={episode.id} />
              <Spacer />
              <ExportButton />
              <ImportButton />
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default Sidebar
