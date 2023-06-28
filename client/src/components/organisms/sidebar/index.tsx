import React, { useContext, useRef } from "react"
import { SidebarFrame, Top } from "./styles"
import NovelProfile from "../../molecules/NovelProfile"
import IconButton from "../../atoms/IconButton"
import { MdChevronLeft, MdMenu, MdMenuOpen } from "react-icons/md"
import EditorContext from "../../../context/EditorContext"
import EpisodeList from "../EpisodeList"
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import ExportButton from "../editorHeader/ExportButton"
import ImportButton from "../editorHeader/ImportButton"

const Sidebar: React.FC = () => {
  const { novel } = useContext(EditorContext)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLDivElement | null>(null)

  const navigate = useNavigate()

  return (
    <>
      <IconButton
        ref={btnRef}
        onClick={onOpen}
        style={{ backgroundColor: "transparent" }}
      >
        <MdMenu style={{ fontSize: 24 }} />
      </IconButton>
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="sm"
      >
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
            <EpisodeList />
          </DrawerBody>
          <DrawerFooter>
            <ExportButton />
            <ImportButton />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default Sidebar
