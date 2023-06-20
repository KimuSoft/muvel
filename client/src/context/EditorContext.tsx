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

  episode: PartialEpisode
  setEpisode: React.Dispatch<React.SetStateAction<PartialEpisode>>

  blocks: Block[]
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>

  isSidebarOpen: boolean
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>

  isSaving: boolean
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
}>({
  novel: initialNovel,
  setNovel: () => {},
  episode: initialPartialEpisode,
  setEpisode: () => {},
  blocks: [],
  setBlocks: () => {},
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
  isSaving: false,
  setIsSaving: () => {},
})
