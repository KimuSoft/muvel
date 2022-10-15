import React from "react"
import styled from "styled-components"
import Header from "../molecules/Header"
// import { useNavigate } from "react-router-dom"
import Editor from "../organisms/Editor"
import { Block, sampleNovelContents } from "../../types"
import GoalWidget from "../molecules/GoalWidget"

const EditorTemp: React.FC = () => {
  // const navigate = useNavigate()

  const [blocks, setBlocks] = React.useState(sampleNovelContents)

  const onChange = async (blocks: Block[]) => {
    setBlocks(blocks)
  }

  return (
    <MainStyle>
      <Header />
      <Body>
        <Editor defaultBlocks={blocks} onChange={onChange} />
        <Widgets>
          <GoalWidget blocks={blocks} />
        </Widgets>
      </Body>
    </MainStyle>
  )
}

const MainStyle = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

const Body = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  height: 100vh;

  padding: 100px 30px 90px;
`

const Widgets = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;

  display: flex;
  flex-direction: column-reverse;
  align-items: center;

  padding: 30px;

  width: 400px;
  height: 100vh;

  // width가 1000px 이하일 경우
  @media (max-width: 1000px) {
    display: none;
  }
`

const Logo = styled.div`
  margin-bottom: 10px;
  text-align: center;

  -ms-user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  user-select: none;
`
const Title = styled.div`
  font-size: 64px;
  font-weight: 700;
`

const Slogan = styled.div`
  font-size: 24px;
  font-weight: 400;
`

export default EditorTemp
