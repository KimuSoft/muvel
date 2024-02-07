import React, { ReactNode, useEffect, useMemo, useState } from "react"
import EditorTemplate, { EditorType } from "../templates/editor"
import EditorContext from "../../context/EditorContext"
import { useNavigate, useParams } from "react-router-dom"
import useCurrentUser from "../../hooks/useCurrentUser"
import { api } from "../../utils/api"
import { Novel } from "../../types/novel.type"
import { Episode, EpisodeType, PartialEpisode } from "../../types/episode.type"
import _ from "lodash"
import { Block } from "../../types/block.type"
import { useRecoilState } from "recoil"
import {
  blocksState,
  editorOptionsState,
  episodeState,
  isAutoSavingState,
  isLoadingState,
  novelState,
  widgetsState,
} from "../../recoil/editor"
import { widgetData } from "../organisms/widget"
import { AxiosError } from "axios"
import { useToast } from "@chakra-ui/react"

const EditorPage: React.FC = () => {
  // Hooks
  const episodeId = useParams<{ id: string }>().id || ""
  const user = useCurrentUser()
  const navigate = useNavigate()
  const toast = useToast()

  // States (Data)
  const [_novel, setNovel] = useRecoilState(novelState)
  const [episode, setEpisode] = useRecoilState(episodeState)
  const [blocks, setBlocks] = useRecoilState(blocksState)

  const [editorOptions] = useRecoilState(editorOptionsState)
  const [widgets] = useRecoilState(widgetsState)

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

  const onEpisodeDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEpisode((episode) => ({ ...episode, description: e.target.value }))
  }

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
  useEffect(() => {
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
    setNovel(data)
  }

  const initEpisode = async () => {
    setIsLoading(true)

    let episode_: Episode
    try {
      episode_ = (await api.get<Episode>(`episodes/${episodeId}`)).data
    } catch (e) {
      if (!(e instanceof AxiosError)) return
      switch (e.response?.status) {
        case 403:
          toast({
            title: "열람 권한 부족",
            description: "이 에피소드를 볼 권한이 부족해요!",
            status: "error",
          })
          break
        case 404:
          toast({
            title: "에피소드를 찾을 수 없음",
            description: "어... 그런 에피소드가 있나요?",
            status: "error",
          })
          break
        case 500:
          toast({
            title: "서버 오류",
            description: "서버 오류가 발생했어요...",
            status: "error",
          })
          break
        default:
          toast({
            title: "알 수 없는 오류",
            description: "알 수 없는 오류가 발생했습니다",
            status: "error",
          })
      }

      return navigate("/")
    }
    if (!episode_) return navigate("/")
    if (!episode.editable) return navigate("/viewer")

    const blocksRes = await api.get<Block[]>(`episodes/${episodeId}/blocks`)

    setEpisode(episode_)
    setBlocks(blocksRes.data)
    setEpisodeCache(episode_)
    setBlocksCache(blocksRes.data)
    setIsLoading(false)
  }

  useEffect(() => {
    initEpisode().then()
  }, [episodeId])

  useEffect(() => {
    refreshNovel().then()
  }, [episode.novelId])

  useEffect(() => {
    localStorage.setItem("widgets", JSON.stringify(Array.from(widgets)))
  }, [widgets])

  useEffect(() => {
    localStorage.setItem("editor_options", JSON.stringify(editorOptions))
  }, [editorOptions])

  const editorType = useMemo(() => {
    if (isLoading) return EditorType.MuvelBlock
    if (episode.episodeType === EpisodeType.EpisodeGroup)
      return EditorType.Markdown
    return EditorType.MuvelBlock
  }, [episode.episodeType, isLoading])

  const activeWidgets = useMemo(() => {
    const activeWidgets_: ReactNode[] = []

    for (const w of widgets) {
      const widgetComponent = widgetData.find((wd) => wd.id === w)?.component
      if (!widgetComponent) {
        console.warn("Widget Component not found: " + w)
        continue
      }
      activeWidgets_.push(widgetComponent)
    }

    return activeWidgets_
  }, [widgets])

  return (
    <EditorContext.Provider value={{ refreshNovel }}>
      <EditorTemplate
        isLoading={isLoading}
        editorType={editorType}
        widgets={activeWidgets}
        episode={episode}
        onEpisodeDescriptionChange={onEpisodeDescriptionChange}
      />
    </EditorContext.Provider>
  )
}

export default EditorPage
