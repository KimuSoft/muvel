import { useCallback, useEffect, useRef, useState } from "react"
import { isEqual, debounce } from "lodash-es"
import { produce } from "immer"
import type { EpisodeData } from "~/features/novel-editor/context/EditorContext"
import { updateEpisode, getEpisodeById } from "~/api/api.episode"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import type { GetEpisodeResponseDto } from "muvel-api-types"

interface UseEpisodeSyncOptions {
  initialEpisode?: GetEpisodeResponseDto
  onError?: (error: unknown) => void
}

export function useEpisodeSync(
  episodeId: string,
  options?: UseEpisodeSyncOptions,
) {
  const previousRef = useRef<EpisodeData | null>(null)

  const [episode, setEpisode] = useState<EpisodeData | null>(() => {
    const initial = options?.initialEpisode || null
    if (initial) previousRef.current = initial
    return initial
  })

  const [syncState, setSyncState] = useState<SyncState>(SyncState.Synced)
  const saveLogicRef = useRef<() => Promise<void>>(null)

  const updateEpisodeState = useCallback(
    (updater: (draft: EpisodeData) => void) => {
      setEpisode((prev) => {
        if (!prev) return prev
        return produce(prev, updater)
      })
    },
    [],
  )

  const fetchLatestEpisode = useCallback(async () => {
    try {
      const res = await getEpisodeById(episodeId)
      setEpisode(res)
      previousRef.current = res
      setSyncState(SyncState.Synced)
    } catch (err) {
      console.error("Failed to refetch episode:", err)
      setSyncState(SyncState.Error)
      options?.onError?.(err)
    }
  }, [episodeId, options])

  const persistChanges = async () => {
    if (!episode || !previousRef.current) return

    const current = episode
    const previous = previousRef.current

    const changes: Partial<EpisodeData> = {}
    const excluded: (keyof EpisodeData)[] = [
      "id",
      "permissions",
      "createdAt",
      "updatedAt",
      "novel",
    ]

    ;(Object.keys(current) as (keyof EpisodeData)[]).forEach((key) => {
      if (excluded.includes(key)) return
      if (!isEqual(current[key], previous[key])) {
        changes[key] = current[key]
      }
    })

    if (Object.keys(changes).length === 0) {
      if (syncState === SyncState.Waiting) setSyncState(SyncState.Synced)
      return
    }

    setSyncState(SyncState.Syncing)

    try {
      await updateEpisode(current.id, changes)
      previousRef.current = current
      setSyncState(SyncState.Synced)
    } catch (e) {
      console.error("Failed to save episode changes:", e)
      setSyncState(SyncState.Error)
      options?.onError?.(e)
    }
  }

  const debouncedPersist = useRef(
    debounce(() => {
      saveLogicRef.current?.()
    }, 1500),
  )

  useEffect(() => {
    saveLogicRef.current = persistChanges
  }, [persistChanges])

  useEffect(() => {
    if (!episode || !previousRef.current) return
    if (!isEqual(episode, previousRef.current)) {
      setSyncState(SyncState.Waiting)
      debouncedPersist.current?.()
    }
  }, [episode])

  return {
    episode,
    updateEpisode: updateEpisodeState,
    fetchLatestEpisode,
    syncState,
  }
}
