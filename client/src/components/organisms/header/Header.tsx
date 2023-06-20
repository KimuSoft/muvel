import React, { useContext } from "react"
import styled from "styled-components"
import ImportButton from "./ImportButton"
import ExportButton from "./ExportButton"
import EpisodeTitle from "../../atoms/EpisodeTitle"
import Auth from "./Auth"
import IconButton from "../../atoms/IconButton"
import EditorContext from "../../../context/EditorContext"
import { MdMenu } from "react-icons/md"
import Sidebar from "../sidebar"

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 15px;

  height: 70px;

  background-color: var(--color-zinc-800);
  width: 100%;

  padding: 0 20px;

  @media (max-width: 1000px) {
    height: 90px;
  }
`

const Header: React.FC = () => {
  const { isSaving } = useContext(EditorContext)

  return (
    <HeaderContainer>
      <Sidebar />
      {isSaving && <span>저장 중...</span>}
      <EpisodeTitle />
      <ExportButton />
      <ImportButton />
      <Auth />
    </HeaderContainer>
  )
}

export default Header
