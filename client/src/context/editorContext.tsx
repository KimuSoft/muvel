import React, { createContext } from "react"
import { IBlock } from "../types"

export default createContext<{
  blocks: IBlock[]
  setBlocks: React.Dispatch<React.SetStateAction<IBlock[]>>

  title: string
  setTitle: React.Dispatch<React.SetStateAction<string>>

  chapter: string
  setChapter: React.Dispatch<React.SetStateAction<string>>

  isSidebarOpen: boolean
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  blocks: [],
  setBlocks: () => {},
  title: "",
  setTitle: () => {},
  chapter: "",
  setChapter: () => {},
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
})
