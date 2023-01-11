import React from "react"
import styled from "styled-components"
import { IBlock } from "../../../types"
import ImportButton from "./ImportButton"
import ExportButton from "./ExportButton"
import EpisodeTitle from "../../atoms/EpisodeTitle"

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

  @media (max-width: 1000px) {
    height: 90px;
  }
`

const Header: React.FC = () => {
  return (
    <HeaderStyle>
      <EpisodeTitle />
      <ExportButton />
      <ImportButton />
    </HeaderStyle>
  )
}

export default Header
