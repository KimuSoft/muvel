import React from "react"
import styled from "styled-components"
import stringToBlock from "./utils/stringToBlock"
import {IBlock} from "./types";
import Header from "./components/Header";
import Editor from "./components/editor";
import GoalWidget from "./components/GoalWidget";

const EditorTemp: React.FC = () => {
  // const navigate = useNavigate()

  // default value is example.txt file form assets
  // stringToBlock(sample)
  const [blocks, setBlocks] = React.useState(stringToBlock("가을"))

  const changeHandler = async (blocks: IBlock[]) => {
    setBlocks(blocks)
  }

  return (
    <MainStyle>
      <Header blocks={blocks} />
      <Body>
        {/*<Editor defaultBlocks={blocks} onChange={onChange} />*/}
        <Editor onChange={changeHandler}/>
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

  padding: 80px 30px 90px;
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

  @media (max-width: 1600px) {
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
