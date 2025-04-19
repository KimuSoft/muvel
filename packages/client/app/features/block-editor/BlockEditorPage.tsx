import React, { type ReactNode, useEffect, useMemo, useState } from "react"
import BlockEditorTemplate from "./BlockEditorTemplate"
import { useNavigate, useParams } from "react-router"
import { widgetData } from "./components/widget"
import { AxiosError } from "axios"
import { api } from "~/utils/api"
import { useUser } from "~/context/UserContext"
import { toaster } from "~/components/ui/toaster"
import { useBlockEditor } from "~/features/block-editor/context/EditorContext"
import { useOption } from "~/context/OptionContext"
import type { Episode, LegacyBlock } from "muvel-api-types"
import { getEpisodeLegacyBlocks } from "~/api/api.episode"
import { differenceWith, isEqual } from "lodash-es"

const BlockEditorPage: React.FC = () => {
  // Hooks
  const episodeId = useParams<{ id: string }>().id || ""
  const user = useUser()
  const navigate = useNavigate()

  // States (Data)

  const [editorOptions] = useOption()

  const {
    episode,
    updateEpisode,
    blocks,
    updateBlocks,
    widgets,
    isLoading,
    setIsLoading,
    setIsAutoSaving,
  } = useBlockEditor()

  // State (Cache) :업데이트 시 변경 사항을 비교하는 용도
  const [episodeCache, setEpisodeCache] = useState<Episode>()
  const [blocksCache, setBlocksCache] = useState<LegacyBlock[]>([])

  useEffect(() => {
    // 로그인되어 있지 않은 경우 로그인 페이지로 이동
    if (!user) {
      window.location.href = import.meta.env.VITE_API_BASE + "/auth/login"
      return
    }
  }, [])

  const onEpisodeDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    updateEpisode((episode) => ({ ...episode, description: e.target.value }))
  }

  // 블록 변경사항을 로드하는 메서드
  const getBlocksChange = () => {
    if (!episodeCache) return []
    // deleted blocks  검증
    const deletedBlocks = blocksCache
      .filter((b) => !blocks.find((b2) => b2.id === b.id))
      .map((b) => ({ id: b.id, isDeleted: true }))

    const difference = differenceWith(
      blocks.map((b, order) => ({ ...b, order })),
      blocksCache.map((b, order) => ({ ...b, order })),
      isEqual,
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

  const initEpisode = async () => {
    setIsLoading(true)

    let episode_: Episode
    try {
      episode_ = (await api.get<Episode>(`episodes/${episodeId}`)).data
    } catch (e) {
      if (!(e instanceof AxiosError)) return
      switch (e.response?.status) {
        case 403:
          toaster.error({
            title: "열람 권한 부족",
            description: "이 에피소드를 볼 권한이 부족해요!",
          })
          break
        case 404:
          toaster.error({
            title: "에피소드를 찾을 수 없음",
            description: "어... 그런 에피소드가 있나요?",
          })
          break
        case 500:
          toaster.error({
            title: "서버 오류",
            description: "서버 오류가 발생했어요...",
          })
          break
        default:
          toaster.error({
            title: "알 수 없는 오류",
            description: "알 수 없는 오류가 발생했습니다",
          })
      }

      return navigate("/")
    }
    if (!episode_) return navigate("/")

    const blocksRes = await getEpisodeLegacyBlocks(episode.id)

    updateEpisode(() => episode_)
    updateBlocks(() => blocksRes)
    setEpisodeCache(episode_)
    setBlocksCache(blocksRes)
    setIsLoading(false)
  }

  useEffect(() => {
    initEpisode().then()
  }, [episodeId])

  useEffect(() => {
    localStorage.setItem("widgets", JSON.stringify(Array.from(widgets)))
  }, [widgets])

  useEffect(() => {
    localStorage.setItem("editor_options", JSON.stringify(editorOptions))
  }, [editorOptions])

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
    <BlockEditorTemplate
      widgets={activeWidgets}
      episode={episode}
      onEpisodeDescriptionChange={onEpisodeDescriptionChange}
    />
  )
}

export default BlockEditorPage
