import React, { createContext } from "react"
import { Novel, initialNovel } from "../types/novel.type"
import {
  Episode,
  PartialEpisode,
  initialPartialEpisode,
} from "../types/episode.type"
import { Block } from "../types/block.type"

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
})
