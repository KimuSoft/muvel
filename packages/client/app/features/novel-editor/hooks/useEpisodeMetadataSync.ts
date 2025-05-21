import { useCallback, useEffect, useRef, useState } from "react"
import type { GetEpisodeResponseDto } from "muvel-api-types"
import { isEqual } from "lodash-es"
import { useDebouncedCallback } from "use-debounce"
import { toaster } from "~/components/ui/toaster"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import { updateEpisodeMetadata } from "~/services/episodeService"
import type { EpisodeData } from "~/features/novel-editor/context/EpisodeContext"

type EpisodePatchData = Partial<
  Omit<EpisodeData, "id" | "permissions" | "createdAt" | "updatedAt" | "novel">
>

interface UseEpisodeSyncOptions {
  initialEpisode?: Omit<GetEpisodeResponseDto, "blocks">
}

export function useEpisodeMetadataSync({
  initialEpisode,
}: UseEpisodeSyncOptions) {
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null)
  const previousEpisodeDataRef = useRef<EpisodeData | null>(null)
  const [syncState, setSyncState] = useState<SyncState>(SyncState.Synced)

  // 저장 로직: episodeData, initialEpisode.id, syncState가 변경되면 재생성됩니다.
  const saveEpisodeChanges = useCallback(async () => {
    if (!episodeData || !initialEpisode?.id) {
      if (!initialEpisode?.id) {
        console.error("Episode ID is missing. Cannot save changes.")
        setSyncState(SyncState.Error)
        toaster.error({
          title: "저장 실패",
          description: "에피소드 ID가 없어 저장할 수 없습니다.",
        })
      }
      return
    }

    const currentData = episodeData
    const previousData = previousEpisodeDataRef.current

    if (!previousData) {
      console.warn(
        "previousEpisodeDataRef.current is null, skipping save. This might indicate an issue.",
      )
      setSyncState(SyncState.Synced)
      return
    }

    const changes: EpisodePatchData = {}
    // forEach 대신 for...of 루프 사용
    for (const key of Object.keys(currentData) as Array<keyof EpisodeData>) {
      const nonComparableFields: Array<keyof EpisodeData> = [
        "id",
        "permissions",
        "createdAt",
        "updatedAt",
        "novel",
      ]
      if (nonComparableFields.includes(key)) continue // forEach의 return과 유사하게 continue 사용

      if (!isEqual(currentData[key], previousData[key])) {
        ;(changes as any)[key] = currentData[key]
      }
    }

    if (Object.keys(changes).length === 0) {
      if (syncState === SyncState.Waiting) {
        setSyncState(SyncState.Synced)
      }
      return
    }

    setSyncState(SyncState.Syncing)

    try {
      console.log("Saving episode changes (via hook):", changes)
      await updateEpisodeMetadata(initialEpisode.id, changes)
      setSyncState(SyncState.Synced)
      previousEpisodeDataRef.current = currentData
    } catch (e) {
      console.error("Failed to save episode changes (via hook):", e)
      toaster.error({
        title: "저장 실패",
        description: "에피소드 정보를 저장하는 데 실패했습니다.",
      })
      setSyncState(SyncState.Error)
    }
  }, [episodeData, initialEpisode?.id, syncState])

  // 디바운스된 저장 함수: saveEpisodeChanges 콜백이 변경되면 useDebouncedCallback이 최신 버전을 사용합니다.
  const debouncedSaveEpisode = useDebouncedCallback(saveEpisodeChanges, 1000)

  // initialEpisode가 변경될 때 상태를 초기화하고, 이전 디바운스된 저장 작업을 취소합니다.
  useEffect(() => {
    debouncedSaveEpisode.cancel()

    if (initialEpisode) {
      setEpisodeData(initialEpisode)
      previousEpisodeDataRef.current = initialEpisode
      setSyncState(SyncState.Synced)
    } else {
      setEpisodeData(null)
      previousEpisodeDataRef.current = null
      setSyncState(SyncState.Synced)
    }
  }, [initialEpisode, debouncedSaveEpisode])

  // 컴포넌트 언마운트 시 디바운스된 저장 작업을 취소합니다.
  useEffect(() => {
    return () => {
      debouncedSaveEpisode.cancel()
    }
  }, [debouncedSaveEpisode])

  // episodeData가 변경될 때마다 실행되어, 변경 사항이 있으면 저장 로직을 트리거합니다.
  useEffect(() => {
    if (!episodeData || !previousEpisodeDataRef.current) {
      return
    }

    const hasMeaningfulChanges = !isEqual(
      episodeData,
      previousEpisodeDataRef.current,
    )

    if (hasMeaningfulChanges) {
      if (syncState !== SyncState.Waiting && syncState !== SyncState.Syncing) {
        setSyncState(SyncState.Waiting)
      }
      debouncedSaveEpisode()
    } else {
      if (syncState === SyncState.Waiting) {
        setSyncState(SyncState.Synced)
      }
    }
  }, [episodeData, debouncedSaveEpisode, syncState])

  return {
    episodeData,
    setEpisodeData,
    syncState,
  }
}
