import React, { useContext, useRef } from "react"
import { SidebarFrame, Top } from "./styles"
import NovelProfile from "../../molecules/NovelProfile"
import IconButton from "../../atoms/IconButton"
import { MdChevronLeft, MdMenu, MdMenuOpen } from "react-icons/md"
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
  useDisclosure,
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import ExportButton from "../../molecules/ExportButton"
import ImportButton from "../../molecules/ImportButton"

const Sidebar: React.FC = () => {
  const { novel } = useContext(EditorContext)
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
            <HStack>
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
