import React, { createContext, useCallback, useContext, useMemo } from "react"
import type { GetEpisodeResponseDto } from "muvel-api-types" // 경로 수정 필요
import { type Draft, produce } from "immer"
import type { SyncState } from "~/features/novel-editor/components/SyncIndicator"

export type EpisodeData = GetEpisodeResponseDto

interface EpisodeProviderProps {
  children: React.ReactNode
  episode: EpisodeData
  setEpisode: React.Dispatch<React.SetStateAction<EpisodeData | null>>
  syncState: SyncState
}

interface EpisodeContextValue {
  episode: EpisodeData
  updateEpisodeData: (
    updater: (draft: Draft<GetEpisodeResponseDto>) => void,
  ) => void
  syncState: SyncState
}

const EpisodeContext = createContext<EpisodeContextValue | null>(null)

export const useEpisodeContext = () => {
  const ctx = useContext(EpisodeContext)
  if (!ctx) {
    throw new Error("useEpisodeContext must be used within EpisodeProvider")
  }
  return ctx
}

export const EpisodeProvider: React.FC<EpisodeProviderProps> = ({
  children,
  episode,
  setEpisode,
  syncState,
}) => {
  // Immer를 사용하여 외부 setEpisode 함수를 호출하는 업데이트 함수
  const updateEpisodeData = useCallback(
    (updater: (draft: Draft<GetEpisodeResponseDto>) => void) => {
      setEpisode((currentEpisode) => {
        if (currentEpisode === null) {
          console.warn(
            "Cannot update episode data because current episode is null.",
          )
          return null // 또는 currentEpisode 반환
        }
        // produce를 사용하여 불변성 유지하며 업데이트
        return produce(currentEpisode, updater)
      })
    },
    [setEpisode],
  ) // 외부에서 받은 setEpisode 함수에 의존

  const contextValue = useMemo(
    () => ({
      episode,
      updateEpisodeData,
      syncState,
    }),
    [episode, updateEpisodeData, syncState],
  )

  return (
    <EpisodeContext.Provider value={contextValue}>
      {children}
    </EpisodeContext.Provider>
  )
}
