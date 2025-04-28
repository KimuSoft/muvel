import type { Block, GetEpisodeResponseDto } from "muvel-api-types"
import React, { useEffect, useMemo, useRef } from "react"
import EditorTemplate from "~/features/novel-editor/EditorTemplate"
import { EditorProvider } from "~/features/novel-editor/context/EditorContext"
import OptionProvider from "~/providers/OptionProvider"
import { debounce } from "lodash-es"
import { getBlocksChange } from "~/features/novel-editor/utils/calculateBlockChanges"
import { updateEpisode, updateEpisodeBlocks } from "~/api/api.episode"
import { toaster } from "~/components/ui/toaster"
import { WidgetProvider } from "~/features/novel-editor/widgets/context/WidgetContext"
import { SyncState } from "~/features/novel-editor/components/SyncIndicator"

const EditorPage: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode: episode_,
}) => {
  const [episode, setEpisode] = React.useState<GetEpisodeResponseDto>(episode_)
  const originalRef = useRef<Block[]>(episode.blocks)
  const [syncState, setSyncState] = React.useState(SyncState.Synced)

  // 편이 바뀐 경우
  useEffect(() => {
    setEpisode(episode_)
    originalRef.current = episode_.blocks
  }, [episode_.id])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (![SyncState.Synced, SyncState.Waiting].includes(syncState)) {
        event.preventDefault()
        event.returnValue = "" // Chrome에서는 이게 필수
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [syncState])

  const handleBlocksChange = useMemo(
    () =>
      debounce(async (blocks: Block[]) => {
        const changes = getBlocksChange(originalRef.current, blocks)
        if (!episode.permissions.edit || !changes.length) return null
        setSyncState(SyncState.Syncing)

        console.log(changes)

        try {
          await updateEpisodeBlocks(episode.id, changes)
          setSyncState(SyncState.Synced)
        } catch (e) {
          console.error(e)
          toaster.error({
            title: "저장 실패",
            description: "변경 사항을 저장하는 데 실패했습니다.",
          })
          setSyncState(SyncState.Error)
        }
        originalRef.current = [...blocks]
      }, 1000),
    [episode.id],
  )

  const handleTitleChange = useMemo(
    () =>
      debounce(async (title: string) => {
        try {
          setSyncState(SyncState.Syncing)
          await updateEpisode(episode.id, { title })
          setEpisode((prev) => ({ ...prev, title }))
          setSyncState(SyncState.Synced)
        } catch (e) {
          console.error(e)
          toaster.error({
            title: "저장 실패",
            description: "제목을 저장하는 데 실패했습니다.",
          })
          setSyncState(SyncState.Error)
        }
      }, 1000),
    [episode.id],
  )

  // syncState를 wait로 변경 후 debounce
  const handleBlocksChange_ = async (blocks: Block[]) => {
    if (!episode.permissions.edit || !blocks.length) return null
    setSyncState(SyncState.Waiting)
    await handleBlocksChange(blocks)
  }

  return (
    <OptionProvider>
      <WidgetProvider>
        <EditorProvider>
          <EditorTemplate
            episode={episode}
            onBlocksChange={handleBlocksChange_}
            onTitleChange={handleTitleChange}
            syncState={syncState}
          />
        </EditorProvider>
      </WidgetProvider>
    </OptionProvider>
  )
}

export default EditorPage
