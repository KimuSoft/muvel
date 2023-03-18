import React, { ReactNode } from "react"
import styled from "styled-components"
import { BsDiamond } from "react-icons/all"

const HandleAction: React.FC<{
  icon?: ReactNode
  name: string
  onClick?(): void
}> = ({ icon, name, onClick }) => {
  return (
    <Container onClick={onClick ? onClick : () => {}}>
      {icon ? icon : <BsDiamond style={{ width: 20, height: 20 }} />}
      <Text>{name}</Text>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;
  align-items: center;

  border-radius: 5px;
  padding: 4px 10px;
  gap: 10px;

  &:hover {
    /* zinc/800 */
    background-color: #27272a;
  }

  transition: background-color 0.2s ease-in-out;
`

const Text = styled.div`
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  width: 100%;

  color: #fff;
`

export default HandleAction
