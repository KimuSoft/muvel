import React, { createContext, useContext, useMemo, useState } from "react"
import { produce } from "immer"
import { initialNovel, type Novel } from "~/types/novel.type"
import {
  initialPartialEpisode,
  type PartialEpisode,
} from "~/types/episode.type"
import { getWidgets } from "../utils/getWidgets"
import type { Block } from "~/types/block.type"

type EditorContextType = {
  novel: Novel
  updateNovel: (recipe: (draft: Novel) => void) => void

  episode: PartialEpisode
  updateEpisode: (recipe: (draft: PartialEpisode) => void) => void

  blocks: Block[]
  updateBlocks: (recipe: (draft: Block[]) => void) => void

  isAutoSaving: boolean
  setIsAutoSaving: React.Dispatch<React.SetStateAction<boolean>>

  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>

  // editorOptions: EditorOption
  // updateEditorOptions: (recipe: (draft: EditorOption) => void) => void

  widgets: Set<string>
  updateWidgets: (recipe: (draft: Set<string>) => void) => void
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export const BlockEditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [novel, setNovel] = useState<Novel>(initialNovel)
  const [episode, setEpisode] = useState<PartialEpisode>(initialPartialEpisode)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [widgets, setWidgets] = useState<Set<string>>(getWidgets())

  const updateNovel = (recipe: (draft: Novel) => void) => {
    setNovel((prev) => produce(prev, recipe))
  }

  const updateEpisode = (recipe: (draft: PartialEpisode) => void) => {
    setEpisode((prev) => produce(prev, recipe))
  }

  const updateBlocks = (recipe: (draft: Block[]) => void) => {
    setBlocks((prev) => produce(prev, recipe))
  }

  const updateWidgets = (recipe: (draft: Set<string>) => void) => {
    setWidgets((prev) => produce(prev, recipe))
  }

  const value = useMemo(
    () => ({
      novel,
      updateNovel,
      episode,
      updateEpisode,
      blocks,
      updateBlocks,
      isAutoSaving,
      setIsAutoSaving,
      isLoading,
      setIsLoading,
      widgets,
      updateWidgets,
    }),
    [novel, episode, blocks, isAutoSaving, isLoading, widgets],
  )

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  )
}

export const useBlockEditor = () => {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider")
  }
  return context
}
