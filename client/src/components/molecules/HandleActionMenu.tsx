import React from "react"
import styled from "styled-components"
import HandleAction from "../atoms/HandleAction"

const HandleActionMenu: React.FC = () => {
  return (
    <MenuContainer>
      <HandleAction name="키뮤키뮤" />
      <HandleAction name="키뮤키뮤" />
      <HandleAction name="키뮤키뮤" />
      <HandleAction name="키뮤키뮤" />
      <HandleAction name="키뮤키뮤" />
    </MenuContainer>
  )
}

const MenuContainer = styled.div`
  position: absolute;
  right: 100px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;

  width: 215px;
  height: 240px;

  padding: 15px 13px;

  /* zinc/900 */
  background-color: #18181b;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
`

export default HandleActionMenu
