import React, { useCallback, useState } from "react"
import { type Draft, produce } from "immer"
import { OptionContext, SetOptionContext } from "~/context/OptionContext"

export const defaultOption: EditorOption = {
  lineHeight: 1.5,
  fontSize: 16,
  gap: 8,
  indent: 1,
  quoteColor: null,
  fontFamily: "Inter",
  color: null,
}

export interface EditorOption {
  quoteColor: any
  lineHeight: number
  fontSize: number
  gap: number
  indent: number
  fontFamily: string
  color: string | null
}

const getOption = (): EditorOption => {
  try {
    const storageOption = JSON.parse(localStorage.getItem("options") || "{}")
    return { ...defaultOption, ...storageOption }
  } catch {
    return defaultOption
  }
}

const OptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [option, _setOption] = useState<EditorOption>(getOption)

  const setOption = useCallback(
    (updater: (draft: Draft<EditorOption>) => void) => {
      _setOption((prev) => {
        const next = produce(prev, updater)
        localStorage.setItem("options", JSON.stringify(next))
        return next
      })
    },
    [],
  )

  return (
    <OptionContext.Provider value={option}>
      <SetOptionContext.Provider value={setOption}>
        {children}
      </SetOptionContext.Provider>
    </OptionContext.Provider>
  )
}

export default OptionProvider
