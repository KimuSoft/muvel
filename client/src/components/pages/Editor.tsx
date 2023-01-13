import React, { createContext, useEffect, useState } from "react"
import EditorTemplate from "../templates/editor"
import { IBlock, INovel } from "../../types"
import EditorContext from "../../context/EditorContext"
import { getRandomSample } from "../../utils/ipsum"
import axios from "axios"
import { useParams } from "react-router-dom"
import useCurrentUser from "../../hooks/useCurrentUser"

const EditorPage: React.FC = () => {
  const user = useCurrentUser()

  const episodeId = useParams<{ id: string }>().id || ""

  const [blocks, setBlocks] = useState<IBlock[]>(getRandomSample())
  const [title, setTitle] = useState<string>("")
  const [chapter, setChapter] = useState<string>("")
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)

  // 사이드바를 위한 소설 전체 데이터 (블록 데이터 제외)
  const [novel, setNovel] = useState<INovel>({
    title: "",
    description: "",
    episodes: [],
  })

  const refreshNovelData = async () => {
    setNovel(await axios.get(""))
  }

  useEffect(() => {
    if (!user) {
      window.location.href = "/login"
      return
    }

    window.onbeforeunload = () => 0
  }, [])

  return (
    <EditorContext.Provider
      value={{
        blocks,
        setBlocks,
        title,
        setTitle,
        chapter,
        setChapter,
        isSidebarOpen,
        setIsSidebarOpen,
        novel,
      }}
    >
      <EditorTemplate />
    </EditorContext.Provider>
  )
}

export default EditorPage
