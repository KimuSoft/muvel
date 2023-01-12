import React from "react"
import Header from "../../organisms/header/Header"
import Editor from "../../organisms/editor"
import GoalWidget from "../../organisms/widget/goal/GoalWidget"
import { Body, MainStyle, Widgets } from "./styles"
import Sidebar from "../../organisms/sidebar"

const EditorTemplate: React.FC = () => {
  return (
    <MainStyle>
      <Header />
      <Sidebar />
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
