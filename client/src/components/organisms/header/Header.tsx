import React, { useContext } from "react"
import styled from "styled-components"
import ImportButton from "./ImportButton"
import ExportButton from "./ExportButton"
import EpisodeTitle from "../../atoms/EpisodeTitle"
import Auth from "./Auth"
import IconButton from "../../atoms/IconButton"
import EditorContext from "../../../context/EditorContext"
import { MdMenu } from "react-icons/md"

const SideBlock = styled.div`
  width: 100%;
`

const HeaderStyle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 15px;

  position: fixed;
  top: 0;
  height: 70px;

  background-color: #27272a;
  width: 100%;

  padding: 0 20px;

  @media (max-width: 1000px) {
    height: 90px;
  }
`

const Header: React.FC = () => {
  const { setIsSidebarOpen } = useContext(EditorContext)

  return (
    <HeaderStyle>
      <IconButton
        onClick={() => setIsSidebarOpen(true)}
        style={{ backgroundColor: "transparent" }}
      >
        <MdMenu style={{ fontSize: 24 }} />
      </IconButton>
      <EpisodeTitle />
      <ExportButton />
      <ImportButton />
      <Auth />
    </HeaderStyle>
  )
}

export default Header
