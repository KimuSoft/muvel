import { type Draft } from "immer"
import { createContext, useContext } from "react"
import { defaultOption, type EditorOption } from "~/providers/OptionProvider"

export const OptionContext = createContext<EditorOption>(defaultOption)
export const SetOptionContext = createContext<
  ((updater: (draft: Draft<EditorOption>) => void) => void) | null
>(null)

export const useOption = () => {
  const option = useContext(OptionContext)
  const setOption = useContext(SetOptionContext)

  if (!option) {
    throw new Error("useOption must be used within an OptionProvider")
  }

  if (!setOption) {
    throw new Error("useSetOption must be used within an OptionProvider")
  }

  return [option, setOption] as const
}
