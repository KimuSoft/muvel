import React from "react"
import EditorHeader from "../../organisms/editorHeader/EditorHeader"
import Editor from "../../organisms/editor"
import GoalWidget from "../../organisms/widget/goal/GoalWidget"
import { Body, MainStyle, Widgets } from "./styles"
import Sidebar from "../../organisms/sidebar"

const EditorTemplate: React.FC = () => {
  return (
    <MainStyle>
      <EditorHeader />
      <Body>
        <Editor />
      </Body>
      <Widgets>
        <GoalWidget />
      </Widgets>
    </MainStyle>
  )
}

export default EditorTemplate
