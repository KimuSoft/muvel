import React, { useEffect, useState } from "react"
import EditorTemplate from "../templates/editor"
import EditorContext from "../../context/EditorContext"
import { useNavigate, useParams } from "react-router-dom"
import useCurrentUser from "../../hooks/useCurrentUser"
import { api } from "../../utils/api"
import { toast } from "react-toastify"
import { Novel } from "../../types/novel.type"
import { Episode } from "../../types/episode.type"
import _ from "lodash"
import axios from "axios"

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

  // 업데이트 시 비교하는 용도
  const [recentEpisode, setRecentEpisode] = useState<Episode>()

  // 블록 변경사항을 로드하는 메서드
  const getBlocksChange = () => {
    if (!recentEpisode) return
    // deleted blocks  검증
    const deletedBlocks = recentEpisode.blocks
      .filter((b) => !episode.blocks.find((b2) => b2.id === b.id))
      .map((b) => ({
        id: b.id,
        isDeleted: true,
      }))

    const difference = _.differenceWith(
      episode.blocks,
      recentEpisode.blocks,
      _.isEqual
    )

    return [...deletedBlocks, ...difference]
  }

  // episode debounce
  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      const blocksChange = getBlocksChange()

      // 최적화용 코드: 변경 사항이 없는 것으로 보이면 api 요청을 보내지 않음
      if (
        !blocksChange?.length &&
        episode.title === recentEpisode?.title &&
        episode.description === recentEpisode?.description
      )
        return

      // 디버깅용 코드
      // toast.info(JSON.stringify(blocksChange))

      // 블록 데이터 업데이트 요청
      await api.post("episodes/update", {
        ...episode,
        blocks: blocksChange,
      })

      setRecentEpisode(episode)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [episode])

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
    setRecentEpisode(data)
  }

  useEffect(() => {
    if (!user) {
      window.location.href = "/auth/login/discord"
      return
    }

    refresh().then()

    // 닫을 때 저장 내용을 잃을 수 있다는 경고 표시
    // 자동 저장을 구현하여 주석 처리함
    // window.onbeforeunload = () => 0
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
