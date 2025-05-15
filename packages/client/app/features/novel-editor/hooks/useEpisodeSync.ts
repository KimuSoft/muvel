import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { GetEpisodeResponseDto } from "muvel-api-types"
import { debounce, isEqual } from "lodash-es"
import { toaster } from "~/components/ui/toaster"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import type { EpisodeData } from "~/features/novel-editor/context/EditorContext"
import { updateEpisodeMetadata } from "~/services/episodeService" // EpisodeData 타입 가져오기

type EpisodePatchData = Partial<
  Omit<EpisodeData, "id" | "permissions" | "createdAt" | "updatedAt" | "novel">
>

interface UseEpisodeSyncOptions {
  initialEpisode?: Omit<GetEpisodeResponseDto, "blocks">
  onSyncStateChange?: (newState: SyncState) => void
}

export function useEpisodeSync({
  initialEpisode,
  onSyncStateChange,
}: UseEpisodeSyncOptions) {
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null)
  const previousEpisodeDataRef = useRef<EpisodeData | null>(null)
  const [episodeSyncState, setEpisodeSyncState] = useState<SyncState>(
    SyncState.Synced,
  )

  const saveLogicRef = useRef<() => Promise<void>>(null)

  useEffect(() => {
    if (initialEpisode) {
      setEpisodeData(initialEpisode)
      previousEpisodeDataRef.current = initialEpisode
      if (episodeSyncState !== SyncState.Synced) {
        setEpisodeSyncState(SyncState.Synced)
        onSyncStateChange?.(SyncState.Synced)
      }
    }
  }, [initialEpisode?.id, onSyncStateChange])

  const saveEpisodeChanges = useCallback(async () => {
    if (
      !episodeData ||
      !previousEpisodeDataRef.current ||
      !initialEpisode?.id
    ) {
      if (!initialEpisode?.id) {
        console.error("Episode ID is missing. Cannot save changes.")
        setEpisodeSyncState(SyncState.Error)
        onSyncStateChange?.(SyncState.Error)
        toaster.error({
          title: "저장 실패",
          description: "에피소드 ID가 없어 저장할 수 없습니다.",
        })
      }
      return
    }

    const currentData = episodeData
    const previousData = previousEpisodeDataRef.current
    const changes: EpisodePatchData = {}

    // 원본 코드의 변경사항 감지 로직과 동일하게 유지
    ;(Object.keys(currentData) as Array<keyof EpisodeData>).forEach((key) => {
      const nonComparableFields: Array<keyof EpisodeData> = [
        "id",
        "permissions",
        "createdAt",
        "updatedAt",
        "novel",
      ]
      if (nonComparableFields.includes(key)) return

      if (!isEqual(currentData[key], previousData[key])) {
        ;(changes as any)[key] = currentData[key]
      }
    })

    if (Object.keys(changes).length === 0) {
      if (episodeSyncState === SyncState.Waiting) {
        setEpisodeSyncState(SyncState.Synced)
        onSyncStateChange?.(SyncState.Synced)
      }
      return
    }

    setEpisodeSyncState(SyncState.Syncing)
    onSyncStateChange?.(SyncState.Syncing)

    try {
      console.log("Saving episode changes (via hook):", changes)
      await updateEpisodeMetadata(initialEpisode, changes) // API 호출 시 ID 사용
      setEpisodeSyncState(SyncState.Synced)
      onSyncStateChange?.(SyncState.Synced)
      previousEpisodeDataRef.current = currentData
    } catch (e) {
      console.error("Failed to save episode changes (via hook):", e)
      toaster.error({
        title: "저장 실패",
        description: "에피소드 정보를 저장하는 데 실패했습니다.",
      })
      setEpisodeSyncState(SyncState.Error)
      onSyncStateChange?.(SyncState.Error)
    }
  }, [episodeData, initialEpisode?.id, episodeSyncState, onSyncStateChange])

  useEffect(() => {
    saveLogicRef.current = saveEpisodeChanges
  }, [saveEpisodeChanges])

  const debouncedSaveEpisode = useMemo(
    () =>
      debounce(() => {
        if (saveLogicRef.current) {
          saveLogicRef.current()
        }
      }, 500),
    [],
  )

  useEffect(() => {
    if (
      episodeData &&
      previousEpisodeDataRef.current &&
      !isEqual(episodeData, previousEpisodeDataRef.current)
    ) {
      if (
        episodeSyncState !== SyncState.Waiting &&
        episodeSyncState !== SyncState.Syncing
      ) {
        setEpisodeSyncState(SyncState.Waiting)
        onSyncStateChange?.(SyncState.Waiting)
      }
      debouncedSaveEpisode()
    } else if (
      episodeData &&
      previousEpisodeDataRef.current &&
      isEqual(episodeData, previousEpisodeDataRef.current) &&
      episodeSyncState === SyncState.Waiting
    ) {
      setEpisodeSyncState(SyncState.Synced)
      onSyncStateChange?.(SyncState.Synced)
    }
  }, [episodeData, debouncedSaveEpisode, episodeSyncState, onSyncStateChange])

  return {
    episodeData,
    setEpisodeData,
    episodeSyncState,
  }
}
