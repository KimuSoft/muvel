import React, { useEffect, useMemo, useRef, useState } from "react"
import type { Block, GetEpisodeResponseDto } from "muvel-api-types"
import EditorTemplate from "~/features/novel-editor/EditorTemplate" // 경로 수정 필요
import {
  EditorProvider,
  type EpisodeData,
} from "~/features/novel-editor/context/EditorContext" // 경로 수정 필요
import OptionProvider from "~/providers/OptionProvider" // 경로 수정 필요
import { WidgetProvider } from "~/features/novel-editor/widgets/context/WidgetContext" // 경로 수정 필요
import { debounce, isEqual } from "lodash-es"
import { getBlocksChange } from "~/features/novel-editor/utils/calculateBlockChanges" // 경로 수정 필요
import { updateEpisode, updateEpisodeBlocks } from "~/api/api.episode" // 경로 수정 필요
import { toaster } from "~/components/ui/toaster" // 경로 수정 필요
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"
import LoadingOverlay from "~/components/templates/LoadingOverlay" // 경로 수정 필요

type EpisodePatchData = Partial<
  Omit<
    EpisodeData,
    | "id"
    | "permissions"
    | "createdAt"
    | "updatedAt"
    | "novel"
    | "isReadable"
    | "isPurchased"
    | "viewCount"
    | "likeCount"
    | "commentCount"
  >
>

const EditorPage: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode: initialEpisodeData,
}) => {
  const [episode, setEpisode] = useState<EpisodeData | null>(null)
  const originalBlocksRef = useRef<Block[]>(initialEpisodeData.blocks)
  const previousEpisodeRef = useRef<EpisodeData | null>(null)
  const [syncState, setSyncState] = useState(SyncState.Synced)
  const saveLogicRef = useRef<() => Promise<void>>(null)

  useEffect(() => {
    const { blocks, ...metaData } = initialEpisodeData
    setEpisode(metaData)
    originalBlocksRef.current = blocks
    previousEpisodeRef.current = metaData
    setSyncState(SyncState.Synced)
  }, [initialEpisodeData.id])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (![SyncState.Synced, SyncState.Waiting].includes(syncState)) {
        event.preventDefault()
        event.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [syncState])

  const saveEpisodeChanges = async () => {
    if (!episode || !previousEpisodeRef.current) return

    const currentData = episode
    const previousData = previousEpisodeRef.current
    const changes: EpisodePatchData = {}

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
      if (syncState === SyncState.Waiting) {
        setSyncState(SyncState.Synced)
      }
      return
    }

    setSyncState(SyncState.Syncing)

    try {
      console.log("Saving episode changes:", changes)
      await updateEpisode(episode.id, changes)
      setSyncState(SyncState.Synced)
      previousEpisodeRef.current = currentData
    } catch (e) {
      console.error("Failed to save episode changes:", e)
      toaster.error({
        title: "저장 실패",
        description: "에피소드 정보를 저장하는 데 실패했습니다.",
      })
      setSyncState(SyncState.Error)
    }
  }

  useEffect(() => {
    saveLogicRef.current = saveEpisodeChanges
  }, [saveEpisodeChanges])

  const debouncedSaveEpisode = useMemo(
    () =>
      debounce(() => {
        if (saveLogicRef.current) {
          saveLogicRef.current()
        }
      }, 1500),
    [],
  )

  useEffect(() => {
    if (
      episode &&
      previousEpisodeRef.current &&
      !isEqual(episode, previousEpisodeRef.current)
    ) {
      setSyncState(SyncState.Waiting)
      debouncedSaveEpisode()
    }
  }, [episode, debouncedSaveEpisode])

  const handleBlocksChange = useMemo(
    () =>
      debounce(async (blocks: Block[]) => {
        const changes = getBlocksChange(originalBlocksRef.current, blocks)
        if (!episode || !episode.permissions.edit || !changes.length)
          return null
        setSyncState(SyncState.Syncing)
        try {
          await updateEpisodeBlocks(episode.id, changes)
          setSyncState(SyncState.Synced)
          originalBlocksRef.current = [...blocks]
        } catch (e) {
          console.error(e)
          toaster.error({
            title: "저장 실패",
            description: "변경 사항을 저장하는 데 실패했습니다.",
          })
          setSyncState(SyncState.Error)
        }
      }, 1000),
    [episode?.id, episode?.permissions.edit],
  )

  const handleBlocksChange_ = async (blocks: Block[]) => {
    if (!episode || !episode.permissions.edit || !blocks.length) return null
    setSyncState(SyncState.Waiting)
    await handleBlocksChange(blocks)
  }

  if (!episode) {
    return <LoadingOverlay />
  }

  return (
    <OptionProvider>
      <WidgetProvider>
        <EditorProvider episode={episode} setEpisode={setEpisode}>
          <EditorTemplate
            initialBlocks={initialEpisodeData.blocks}
            onBlocksChange={handleBlocksChange_}
            syncState={syncState}
          />
        </EditorProvider>
      </WidgetProvider>
    </OptionProvider>
  )
}

export default EditorPage
