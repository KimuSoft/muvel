import React, { createContext } from "react"

export default createContext<{
  refreshNovel: () => Promise<unknown>
}>({
  refreshNovel: () => Promise.resolve(),
})
