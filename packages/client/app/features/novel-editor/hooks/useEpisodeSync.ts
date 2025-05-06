import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
    console.log("Initializing episode state...")
    const initial = options?.initialEpisode || null
    if (initial) previousRef.current = initial

    return initial
  })

  const [syncState, setSyncState] = useState<SyncState>(SyncState.Synced)

  const updateEpisodeState = useCallback(
    (updater: (draft: EpisodeData) => void) => {
      setEpisode((prev) => {
        console.log("Updating episode state...", produce(prev, updater))
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

  // 최신 상태는 ref로 가져옴
  const debouncedUpdate = useCallback(
    debounce(async (previous: EpisodeData, current: EpisodeData) => {
      console.log("Debounced update called")

      console.log("Current episode:", current)
      console.log("Previous episode:", previous)

      if (!current || !previous) return

      const changes: Partial<EpisodeData> = {}
      const excluded: (keyof EpisodeData)[] = [
        "id",
        "permissions",
        "createdAt",
        "updatedAt",
        "novel",
      ]

      for (const key of Object.keys(current) as (keyof EpisodeData)[]) {
        if (excluded.includes(key)) continue
        if (!isEqual(current[key], previous[key])) {
          changes[key] = current[key]
        }
      }

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
    }, 500),
    [],
  )

  useEffect(() => {
    if (!episode || !previousRef.current) return
    setSyncState(SyncState.Waiting)
    if (!isEqual(episode, previousRef.current)) {
      void debouncedUpdate(previousRef.current, episode)
    }
  }, [episode])

  useEffect(() => {
    if (options?.initialEpisode) {
      setEpisode(options.initialEpisode)
      previousRef.current = options.initialEpisode
    } else if (episodeId) {
      void fetchLatestEpisode()
    }
  }, [episodeId, options?.initialEpisode, fetchLatestEpisode])

  return {
    episode,
    updateEpisode: updateEpisodeState,
    fetchLatestEpisode,
    syncState,
  }
}
