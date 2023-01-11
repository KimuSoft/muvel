import React, { createContext } from "react"
import { IUser } from "../types"

export default createContext<{
  user: IUser | null
}>({ user: null })
