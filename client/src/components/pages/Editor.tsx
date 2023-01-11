import React, { createContext, useEffect, useState } from "react"
import EditorTemplate from "../templates/editor"
import stringToBlock from "../../utils/stringToBlock"
import { IBlock } from "../../types"
import EditorContext from "../../context/editorContext"

const EditorPage: React.FC = () => {
  const [blocks, setBlocks] = useState<IBlock[]>(stringToBlock("가을"))
  const [title, setTitle] = useState<string>("")
  const [chapter, setChapter] = useState<string>("")

  useEffect(() => {
    window.onbeforeunload = () => 0
  }, [])

  return (
    <EditorContext.Provider value={{ blocks, setBlocks, title, setTitle, chapter, setChapter }}>
      <EditorTemplate />
    </EditorContext.Provider>
  )
}

export default EditorPage
