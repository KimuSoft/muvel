import React from "react"
import Header from "../../organisms/header/Header"
import Editor from "../../organisms/editor"
import GoalWidget from "../../organisms/widget/goal/GoalWidget"
import { Body, MainStyle, Widgets } from "./styles"

const EditorTemplate: React.FC = () => {
  return (
    <MainStyle>
      <Header />
      <Body>
        <Editor />
        <Widgets>
          <GoalWidget />
        </Widgets>
      </Body>
    </MainStyle>
  )
}

export default EditorTemplate
