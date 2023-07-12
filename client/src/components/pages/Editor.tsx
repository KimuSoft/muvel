import React, { useEffect, useState } from "react"
import EditorTemplate from "../templates/editor"
import EditorContext from "../../context/EditorContext"
import { useNavigate, useParams } from "react-router-dom"
import useCurrentUser from "../../hooks/useCurrentUser"
import { api } from "../../utils/api"
import { toast } from "react-toastify"
import { Novel } from "../../types/novel.type"
import { Episode, PartialEpisode } from "../../types/episode.type"
import _ from "lodash"
import { Block } from "../../types/block.type"
import { useRecoilState } from "recoil"
import {
  blocksState,
  episodeState,
  isAutoSavingState,
  isLoadingState,
  novelState,
} from "../../recoil/editor"

const EditorPage: React.FC = () => {
  // Hooks
  const episodeId = useParams<{ id: string }>().id || ""
  const user = useCurrentUser()
  const navigate = useNavigate()

  // States (Data)
  const [_novel, setNovel] = useRecoilState(novelState)
  const [episode, setEpisode] = useRecoilState(episodeState)
  const [blocks, setBlocks] = useRecoilState(blocksState)

  // State (Cache) :업데이트 시 변경 사항을 비교하는 용도
  const [episodeCache, setEpisodeCache] = useState<PartialEpisode>()
  const [blocksCache, setBlocksCache] = useState<Block[]>([])

  const [isLoading, setIsLoading] = useRecoilState(isLoadingState)
  const [_isAutoSaving, setIsAutoSaving] = useRecoilState(isAutoSavingState)

  useEffect(() => {
    // 로그인되어 있지 않은 경우 로그인 페이지로 이동
    if (!user) {
      window.location.href = import.meta.env.VITE_API_BASE + "/auth/login"
      return
    }
  }, [])

  // 블록 변경사항을 로드하는 메서드
  const getBlocksChange = () => {
    if (!episodeCache) return []
    // deleted blocks  검증
    const deletedBlocks = blocksCache
      .filter((b) => !blocks.find((b2) => b2.id === b.id))
      .map((b) => ({ id: b.id, isDeleted: true }))

    const difference = _.differenceWith(
      blocks.map((b, order) => ({ ...b, order })),
      blocksCache.map((b, order) => ({ ...b, order })),
      _.isEqual
    )

    return [...deletedBlocks, ...difference]
  }

  const isEpisodeUpdated = () =>
    episode.title !== episodeCache?.title ||
    episode.description !== episodeCache?.description ||
    episode.chapter !== episodeCache?.chapter

  // 변경사항 자동 저장 (Debounce)
  React.useEffect(() => {
    // 변경사항이 아직 서버에 올라가지 않았다면 경고
    // if (isEpisodeUpdated() || getBlocksChange().length) {
    //   window.onbeforeunload = () => 0
    // } else {
    //   window.onbeforeunload = undefined
    // }
    if (isLoading) return

    const timeout = setTimeout(async () => {
      if (isLoading) return
      if (episodeCache?.id !== episode.id) return

      setIsAutoSaving(true)

      // 에피소드 변경사항 체크
      if (isEpisodeUpdated()) {
        // 에피소드 업데이트 요청
        await api.put(`episodes/${episodeId}`, {
          title: episode.title || "제목 없음",
          description: episode.description,
          chapter: episode.chapter,
        })
        setEpisodeCache(episode)
      }

      // 블록 변경사항 체크
      const blocksChange = getBlocksChange()
      if (blocksChange?.length) {
        // 블록 데이터 업데이트 요청
        await api.patch(`episodes/${episodeId}/blocks`, blocksChange)
        setBlocksCache(blocks)
      }

      setIsAutoSaving(false)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [episode, blocks])

  const refreshNovel = async () => {
    const { data } = await api.get<Novel>(`novels/${episode.novelId}`)
    data?.episodes?.sort((a, b) => a.order - b.order)
    setNovel(data)
  }

  const initEpisode = async () => {
    setIsLoading(true)
    const episodeRes = await api.get<Episode>(`episodes/${episodeId}`)

    if (!episodeRes.data) {
      toast.error("해당 에피소드를 찾을 수 없습니다.")
      return navigate("/")
    }

    const blocksRes = await api.get<Block[]>(`episodes/${episodeId}/blocks`)

    setEpisode(episodeRes.data)
    setBlocks(blocksRes.data)
    setEpisodeCache(episodeRes.data)
    setBlocksCache(blocksRes.data)
    setIsLoading(false)
  }

  useEffect(() => {
    initEpisode().then()
  }, [episodeId])

  useEffect(() => {
    refreshNovel().then()
  }, [episode])

  return (
    <EditorContext.Provider value={{ refreshNovel }}>
      <EditorTemplate />
    </EditorContext.Provider>
  )
}

export default EditorPage
