import React from "react"
import EditorHeader from "../../organisms/editor/EditorHeader"
import MuvelBlockEditor from "../../organisms/editor/MuvelBlockEditor"
import GoalWidget from "../../organisms/widget/goal/GoalWidget"
import { Body, MainStyle, Widgets } from "./styles"
import EditorSkeleton from "./EditorSkeleton"
import MarkdownEditor from "../../organisms/editor/MarkdownEditor"

export enum EditorType {
  MuvelBlock,
  Markdown,
}

const EditorTemplate: React.FC<{
  isLoading: boolean
  editorType: EditorType
}> = ({ isLoading, editorType }) => {
  return (
    <MainStyle>
      <EditorHeader />
      <Body>
        {!isLoading ? (
          editorType === EditorType.MuvelBlock ? (
            <MuvelBlockEditor />
          ) : (
            <MarkdownEditor />
          )
        ) : (
          <EditorSkeleton />
        )}
      </Body>
      <Widgets>
        <GoalWidget />
      </Widgets>
    </MainStyle>
  )
}

export default EditorTemplate
