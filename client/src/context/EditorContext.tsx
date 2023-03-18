import React, { createContext } from "react"
import { Novel } from "../types/novel.type"
import { Episode } from "../types/episode.type"

export default createContext<{
  novel: Novel
  setNovel: React.Dispatch<React.SetStateAction<Novel>>

  episode: Episode
  setEpisode: React.Dispatch<React.SetStateAction<Episode>>

  isSidebarOpen: boolean
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>

  isSaving: boolean
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
}>({
  novel: {
    id: "",
    title: "",
    description: "",
    episodes: [],
    author: { id: "" },
  },
  setNovel: () => {},
  episode: {
    id: "",
    title: "",
    chapter: "",
    description: "",
    blocks: [],
    novel: { id: "" },
  },
  setEpisode: () => {},
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
  isSaving: false,
  setIsSaving: () => {},
})
