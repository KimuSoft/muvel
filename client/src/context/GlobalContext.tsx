import React, { createContext } from "react"
import { User } from "../types/user.type"

export default createContext<{
  user: User | null
}>({ user: null })
