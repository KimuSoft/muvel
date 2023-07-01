import React, { createContext } from "react"
import { Novel, initialNovel } from "../types/novel.type"
import {
  Episode,
  PartialEpisode,
  initialPartialEpisode,
} from "../types/episode.type"
import { Block } from "../types/block.type"
import { EditorOption } from "../types"

export default createContext<{
  novel: Novel
  setNovel: React.Dispatch<React.SetStateAction<Novel>>

  refreshNovel: () => Promise<unknown>

  episode: PartialEpisode
  setEpisode: React.Dispatch<React.SetStateAction<PartialEpisode>>

  blocks: Block[]
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>

  isSaving: boolean
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>

  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>

  option: EditorOption
  setOption: React.Dispatch<React.SetStateAction<EditorOption>>
}>({
  novel: initialNovel,
  setNovel: () => {},
  refreshNovel: () => Promise.resolve(),
  episode: initialPartialEpisode,
  setEpisode: () => {},
  blocks: [],
  setBlocks: () => {},
  isSaving: false,
  setIsSaving: () => {},
  isLoading: false,
  setIsLoading: () => {},
  option: {} as unknown as EditorOption,
  setOption: () => {},
})
