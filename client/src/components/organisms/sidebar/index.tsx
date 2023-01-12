import React, { useContext } from "react"
import { SidebarFrame, Top } from "./styles"
import NovelProfile from "../../molecules/NovelProfile"
import IconButton from "../../atoms/IconButton"
import { MdChevronLeft, MdMenuOpen } from "react-icons/md"
import EditorContext from "../../../context/editorContext"
import EpisodeList from "../EpisodeList"

const Sidebar: React.FC = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useContext(EditorContext)

  return (
    <SidebarFrame isOpen={isSidebarOpen}>
      <Top>
        <IconButton
          text={"다른 작품 쓰기"}
          style={{ backgroundColor: "transparent", marginRight: "auto" }}
        >
          <MdChevronLeft />
        </IconButton>
        <IconButton
          style={{ backgroundColor: "transparent" }}
          onClick={() => setIsSidebarOpen(false)}
        >
          <MdMenuOpen style={{ fontSize: 24 }} />
        </IconButton>
      </Top>
      <NovelProfile />
      <EpisodeList />
    </SidebarFrame>
  )
}

export default Sidebar
