import React, { ReactNode } from "react"
import EditorHeader from "../../organisms/editor/EditorHeader"
import MuvelBlockEditor from "../../organisms/editor/MuvelBlockEditor"
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
  widgets: ReactNode[]
}> = ({ isLoading, editorType, widgets }) => {
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
      <Widgets>{widgets}</Widgets>
    </MainStyle>
  )
}

export default EditorTemplate
