import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type { EditorView } from "prosemirror-view"
import { highlightPluginKey } from "~/features/novel-editor/plugins/highlightPlugin"
import type { EditorState } from "prosemirror-state" // Immer produce 및 Draft 타입 임포트
import { Node as PMNode } from "prosemirror-model"

// Match 타입 정의
interface Match {
  from: number
  to: number
}

// EditorProvider Props 타입 정의
interface EditorProviderProps {
  children: React.ReactNode
  onDocUpdate: (doc: PMNode) => void
}

interface EditorContextValue {
  // Prosemirror 관련
  view: EditorView | null
  setView: (view: EditorView | null) => void
  editorState: EditorState | null
  setEditorState: (state: EditorState | null) => void
  onDocUpdate: (doc: PMNode) => void // 문서 업데이트 핸들러

  // Prosemirror 유틸
  setHighlightDecorations: (matches: Match[], currentIndex: number) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

export const useEditorContext = () => {
  const ctx = useContext(EditorContext)
  if (!ctx) {
    throw new Error("useEditorContext must be used within EditorProvider")
  }
  return ctx
}

export const EditorProvider: React.FC<EditorProviderProps> = ({
  children,
  onDocUpdate,
}) => {
  const [view, setView] = useState<EditorView | null>(null)
  const [editorState, setEditorState] = useState<EditorState | null>(null)

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

  const contextValue = useMemo(
    () => ({
      view,
      setView,
      editorState,
      setEditorState,
      onDocUpdate,
      setHighlightDecorations,
    }),
    [view, editorState, onDocUpdate, setHighlightDecorations],
  )

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  )
}
