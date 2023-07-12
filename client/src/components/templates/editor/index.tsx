import React from "react"
import EditorHeader from "../../organisms/editor/EditorHeader"
import Editor from "../../organisms/editor/MuvelBlockEditor"
import GoalWidget from "../../organisms/widget/goal/GoalWidget"
import { Body, MainStyle, Widgets } from "./styles"

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
