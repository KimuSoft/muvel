import React, { useCallback, useState } from "react"
import { type Draft, produce } from "immer"
import { OptionContext, SetOptionContext } from "~/context/OptionContext"

export const defaultOption: EditorStyleOption = {
  lineHeight: 1.8,
  fontSize: 18,
  indent: 0,
  fontWeight: 400,
  fontFamily: '"Pretendard Variable"',
  color: null,
  blockGap: 7,
  backgroundColor: null,
  editorMaxWidth: 840,
}

export interface EditorStyleOption {
  // 줄 간격
  lineHeight: number
  // 폰트 크기
  fontSize: number
  // 폰트 두께
  fontWeight: number
  // 들여쓰기
  indent: number
  // 문단 간격
  blockGap: number
  // 폰트 패밀리
  fontFamily: string
  // 자간
  // letterSpacing: number
  // 글꼴 색상
  color: string | null
  // 배경 색상 (에디터)
  backgroundColor: string | null
  // 에디터 최대 너비
  editorMaxWidth: number
}

const getOption = (): EditorStyleOption => {
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
  const [option, _setOption] = useState<EditorStyleOption>(getOption)

  const setOption = useCallback(
    (updater: (draft: Draft<EditorStyleOption>) => void) => {
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
