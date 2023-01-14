import React, { useEffect, useState } from "react"
import EditorTemplate from "../templates/editor"
import { IBlock, INovel } from "../../types"
import EditorContext from "../../context/EditorContext"
import { useNavigate, useParams } from "react-router-dom"
import useCurrentUser from "../../hooks/useCurrentUser"
import { api } from "../../utils/api"
import { toast } from "react-toastify"

const EditorPage: React.FC = () => {
  const user = useCurrentUser()

  const navigate = useNavigate()

  const episodeId = useParams<{ id: string }>().id || ""

  // Episode Data
  const [blocks, setBlocks] = useState<IBlock[]>([]) //getRandomSample()
  const [title, setTitle] = useState<string>("")
  const [chapter, setChapter] = useState<string>("")
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)

  // 사이드바를 위한 소설 전체 데이터 (블록 데이터 제외)
  const [novelId, setNovelId] = useState<string>("")
  const [novel, setNovel] = useState<INovel>({
    title: "",
    description: "",
    episodes: [],
    id: 0,
  })

  const refreshNovelData = async () => {
    const { data } = await api.get("novels", {
      params: {
        id: novelId,
        loadEpisodes: true,
      },
    })

    setNovel(data)
  }

  const refreshEpisodeData = async () => {
    const { data } = await api.get("episodes", {
      params: {
        id: episodeId,
        loadBlocks: true,
        loadNovel: true,
      },
    })

    if (!data) {
      toast.error(
        "해당 에피소드를 찾을 수 없어 가장 최근 작업한 페이지로 이동합니다."
      )
      return navigate("/")
    }

    console.log(data)
    setNovelId(data.novel.id)
    setBlocks(data.blocks!)
    setTitle(data.title)
    setChapter(data.chapter)
  }

  useEffect(() => {
    if (!user) {
      window.location.href = "/login"
      return
    }

    refreshEpisodeData().then()

    window.onbeforeunload = () => 0
  }, [])

  useEffect(() => {
    if (!isSidebarOpen) return
    refreshNovelData().then()
  }, [isSidebarOpen])

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
        episodeId,
      }}
    >
      <EditorTemplate />
    </EditorContext.Provider>
  )
}

export default EditorPage
