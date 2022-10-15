import React from "react"
import styled from "styled-components"

const TitleBlock = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  padding: 0 0;
  gap: 15px;

  width: 100%;
  height: 80px;

  @media (max-width: 1000px) {
    flex-direction: column;
    gap: 5px;
  }
`

const Title = styled.h1`
  font-size: 24px;
  font-weight: 500;
  color: #fff;

  @media (max-width: 1000px) {
    font-size: 20px;
  }

  margin: 0 0;
`

const SubTitle = styled.h2`
  font-weight: 300;
  font-size: 18px;
  color: #71717a;
  margin: 0 0;

  @media (max-width: 1000px) {
    font-size: 16px;
  }
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
      <TitleBlock>
        <Title>여신이 되어버린 이야기!</Title>
        <SubTitle>EP.01 여신이라 부르지 말아주세요!</SubTitle>
      </TitleBlock>
    </HeaderStyle>
  )
}

export default Header
