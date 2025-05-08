import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type { GetEpisodeResponseDto } from "muvel-api-types" // 경로 수정 필요
import type { EditorView } from "prosemirror-view"
import { type Draft, produce } from "immer"
import { highlightPluginKey } from "~/features/novel-editor/plugins/highlightPlugin" // Immer produce 및 Draft 타입 임포트

// Match 타입 정의
interface Match {
  from: number
  to: number
}

export type EpisodeData = Omit<GetEpisodeResponseDto, "blocks">

interface EditorContextValue {
  view: EditorView | null
  setView: (view: EditorView | null) => void
  setHighlightDecorations: (matches: Match[], currentIndex: number) => void
  episode: EpisodeData
  updateEpisodeData: (
    updater: (draft: Draft<GetEpisodeResponseDto>) => void,
  ) => void // Immer 업데이트 함수
}

const EditorContext = createContext<EditorContextValue | null>(null)

export const useEditorContext = () => {
  const ctx = useContext(EditorContext)
  if (!ctx) {
    throw new Error("useEditorContext must be used within EditorProvider")
  }
  return ctx
}

// EditorProvider Props 타입 정의
interface EditorProviderProps {
  children: React.ReactNode
  episode: EpisodeData
  setEpisode: React.Dispatch<React.SetStateAction<EpisodeData | null>> // 외부(EditorPage)에서 setEpisode 함수 받기
}

export const EditorProvider: React.FC<EditorProviderProps> = ({
  children,
  episode,
  setEpisode,
}) => {
  const [view, setView] = useState<EditorView | null>(null)

  // 데코레이션 업데이트 함수 (메타 트랜잭션)
  const setHighlightDecorations = useCallback(
    (matches: Match[], currentIndex: number) => {
      if (!view) return
      const tr = view.state.tr
      tr.setMeta(highlightPluginKey, {
        type: "UPDATE_HIGHLIGHTS",
        matches,
        currentIndex,
      })
      view.dispatch(tr)
    },
    [view],
  )

  // Immer를 사용하여 외부 setEpisode 함수를 호출하는 업데이트 함수
  const updateEpisodeData = useCallback(
    (updater: (draft: Draft<GetEpisodeResponseDto>) => void) => {
      setEpisode((currentEpisode) => {
        if (currentEpisode === null) {
          console.warn(
            "Cannot update episode data because current episode is null.",
          )
          return null // 또는 currentEpisode 반환
        }
        // produce를 사용하여 불변성 유지하며 업데이트
        return produce(currentEpisode, updater)
      })
    },
    [setEpisode],
  ) // 외부에서 받은 setEpisode 함수에 의존

  const contextValue = useMemo(
    () => ({
      view,
      setView,
      setHighlightDecorations,
      episode,
      updateEpisodeData,
    }),
    [view, setHighlightDecorations, episode, updateEpisodeData],
  )

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  )
}
