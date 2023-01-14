import React, { useEffect, useState } from "react"
import EditorTemplate from "../templates/editor"
import EditorContext from "../../context/EditorContext"
import { useNavigate, useParams } from "react-router-dom"
import useCurrentUser from "../../hooks/useCurrentUser"
import { api } from "../../utils/api"
import { toast } from "react-toastify"
import { Novel } from "../../types/novel.type"
import { Episode } from "../../types/episode.type"

const EditorPage: React.FC = () => {
  const episodeId = useParams<{ id: string }>().id || ""

  const user = useCurrentUser()
  const navigate = useNavigate()

  const [novel, setNovel] = useState<Novel>({
    id: "",
    title: "",
    description: "",
    episodes: [],
    author: { id: "" },
  })

  const [episode, setEpisode] = useState<Episode>({
    id: "",
    title: "",
    chapter: "",
    description: "",
    blocks: [],
    novel: { id: "" },
  })

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)

  const refreshNovel = async () => {
    const { data } = await api.get<Novel>("novels", {
      params: {
        id: episode.novel.id,
        loadEpisodes: true,
      },
    })

    setNovel(data)
  }

  const refresh = async () => {
    const { data } = await api.get<Episode>("episodes", {
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

    setEpisode(data)
  }

  useEffect(() => {
    if (!user) {
      window.location.href = "/login"
      return
    }

    refresh().then()

    window.onbeforeunload = () => 0
  }, [])

  useEffect(() => {
    refresh().then()
  }, [episodeId])

  useEffect(() => {
    if (!isSidebarOpen) return
    refreshNovel().then()
  }, [isSidebarOpen, episode])

  return (
    <EditorContext.Provider
      value={{
        novel,
        setNovel,
        episode,
        setEpisode,
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      <EditorTemplate />
    </EditorContext.Provider>
  )
}

export default EditorPage
