import React, { createContext } from "react"
import { PartialBlock } from "../types/block.type"
import { Novel } from "../types/novel.type"

export default createContext<{
  // episode data (IEpisode)
  blocks: PartialBlock[]
  setBlocks: React.Dispatch<React.SetStateAction<PartialBlock[]>>

  title: string
  setTitle: React.Dispatch<React.SetStateAction<string>>

  chapter: string
  setChapter: React.Dispatch<React.SetStateAction<string>>

  // sidebar
  isSidebarOpen: boolean
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>

  episodeId: string

  novel: Novel
}>({
  blocks: [],
  setBlocks: () => {},
  title: "",
  setTitle: () => {},
  chapter: "",
  setChapter: () => {},
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
  episodeId: "",
  novel: {
    title: "",
    description: "",
    episodes: [],
    id: "",
    author: { id: "" },
  },
})
