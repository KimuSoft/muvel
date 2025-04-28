import type { Block } from "muvel-api-types"
import type { EditorView } from "prosemirror-view"
import React, { createContext, useContext, useRef, useState } from "react"

interface EditorContextValue {
  view: EditorView | null
  setView: (view: EditorView | null) => void
  getBlocks: () => Block[]
  setBlocks: (blocks: Block[]) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

export const useEditorContext = () => {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error("EditorContext must be used within EditorProvider")
  return ctx
}

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [view, setView] = useState<EditorView | null>(null)
  const blocksRef = useRef<Block[]>([])

  return (
    <EditorContext.Provider
      value={{
        view,
        setView,
        getBlocks: () => blocksRef.current,
        setBlocks: (blocks) => {
          blocksRef.current = blocks
        },
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}
