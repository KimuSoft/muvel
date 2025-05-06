import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react"
import type { Block, GetEpisodeResponseDto } from "muvel-api-types"
import type { EditorView } from "prosemirror-view"
import type { Draft } from "immer"
import { highlightPluginKey } from "~/features/novel-editor/plugins/highlightPlugin"

interface Match {
  from: number
  to: number
}

export type EpisodeData = GetEpisodeResponseDto

interface EditorContextValue {
  view: EditorView | null
  setView: (view: EditorView | null) => void
  getBlocks: () => Block[]
  setBlocks: (blocks: Block[]) => void
  setHighlightDecorations: (matches: Match[], currentIndex: number) => void
  episode: EpisodeData
  updateEpisodeData: (updater: (draft: Draft<EpisodeData>) => void) => void
  fetchLatestEpisode: () => Promise<void>
}

const EditorContext = createContext<EditorContextValue | null>(null)

export const useEditorContext = () => {
  const ctx = useContext(EditorContext)
  if (!ctx) {
    throw new Error("useEditorContext must be used within EditorProvider")
  }
  return ctx
}

interface EditorProviderProps {
  children: React.ReactNode
  episode: EpisodeData
  setEpisode: (updater: (draft: Draft<EpisodeData>) => void) => void
  fetchLatestEpisode: () => Promise<void>
}

export const EditorProvider: React.FC<EditorProviderProps> = ({
  children,
  episode,
  setEpisode,
  fetchLatestEpisode,
}) => {
  const [view, setView] = useState<EditorView | null>(null)
  const blocksRef = useRef<Block[]>([])

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

  const updateEpisodeData = useCallback(
    (updater: (draft: Draft<EpisodeData>) => void) => {
      setEpisode(updater)
    },
    [setEpisode],
  )

  const contextValue = useMemo(
    () => ({
      view,
      setView,
      getBlocks: () => blocksRef.current,
      setBlocks: (blocks: Block[]) => {
        blocksRef.current = blocks
      },
      setHighlightDecorations,
      episode,
      updateEpisodeData,
      fetchLatestEpisode,
    }),
    [
      view,
      setHighlightDecorations,
      episode,
      updateEpisodeData,
      fetchLatestEpisode,
    ],
  )

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  )
}
