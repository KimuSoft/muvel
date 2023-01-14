import React, { createContext } from "react"
import { IBlock, INovel } from "../types"

export default createContext<{
  // episode data (IEpisode)
  blocks: IBlock[]
  setBlocks: React.Dispatch<React.SetStateAction<IBlock[]>>

  title: string
  setTitle: React.Dispatch<React.SetStateAction<string>>

  chapter: string
  setChapter: React.Dispatch<React.SetStateAction<string>>

  // sidebar
  isSidebarOpen: boolean
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>

  episodeId: string

  novel: INovel
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
    id: 0,
  },
})
