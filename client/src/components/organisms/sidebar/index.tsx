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
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
} from "@chakra-ui/react"

const Sidebar: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLDivElement | null>(null)

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
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent w="3xl">
          <DrawerBody>
            <Top>
              <IconButton
                text={"다른 작품 쓰기"}
                style={{ backgroundColor: "transparent", marginRight: "auto" }}
              >
                <MdChevronLeft />
              </IconButton>
              <IconButton
                style={{ backgroundColor: "transparent" }}
                onClick={onClose}
              >
                <MdMenuOpen style={{ fontSize: 24 }} />
              </IconButton>
            </Top>
            <NovelProfile />
            <EpisodeList />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default Sidebar
