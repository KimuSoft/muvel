import React from "react"
import styled from "styled-components"

const TitleBlock = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  padding: 0 0;
  gap: 15px;

  // if 1000px or less
  @media (max-width: 1000px) {
    flex-direction: column;
    gap: 5px;
  }

  width: 100%;
  height: 100px;
`

const Title = styled.h1`
  font-size: 24px;
  font-weight: 500;
  color: #fff;

  margin: 0 0;
`

const SubTitle = styled.h2`
  font-weight: 300;
  font-size: 18px;
  color: #71717a;
  margin: 0 0;
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
`

const Header: React.FC = () => {
  return (
    <HeaderStyle>
      <TitleBlock>
        <Title>허클베리 핀의 모험</Title>
        <SubTitle>4편: 핀과 제이크의 어드벤처 타임</SubTitle>
      </TitleBlock>
    </HeaderStyle>
  )
}

export default Header
