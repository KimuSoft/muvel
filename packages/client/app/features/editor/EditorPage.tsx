import type { Block, GetEpisodeResponseDto } from "muvel-api-types"
import React, { useEffect, useMemo, useRef } from "react"
import EditorTemplate from "~/features/editor/EditorTemplate"
import { EditorProvider } from "~/features/editor/context/EditorContext"
import OptionProvider from "~/providers/OptionProvider"
import { debounce } from "lodash-es"
import { getBlocksChange } from "~/features/editor/utils/calculateBlockChanges"
import { updateEpisode, updateEpisodeBlocks } from "~/api/api.episode"
import { toaster } from "~/components/ui/toaster"
import { WidgetLayoutProvider } from "~/features/editor/widgets/context/WidgetLayoutContext"

const EditorPage: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode: episode_,
}) => {
  const [episode, setEpisode] = React.useState<GetEpisodeResponseDto>(episode_)
  const originalRef = useRef<Block[]>(episode.blocks)
  const [isAutoSaving, setIsAutoSaving] = React.useState(false)

  // 편이 바뀐 경우
  useEffect(() => {
    setEpisode(episode_)
    originalRef.current = episode_.blocks
  }, [episode_.id])

  const handleBlocksChange = useMemo(
    () =>
      debounce(async (blocks: Block[]) => {
        const changes = getBlocksChange(originalRef.current, blocks)
        if (!changes.length) return null
        setIsAutoSaving(true)

        try {
          await updateEpisodeBlocks(episode.id, changes)
        } catch (e) {
          console.error(e)
          toaster.error({
            title: "저장 실패",
            description: "변경 사항을 저장하는 데 실패했습니다.",
          })
        } finally {
          setIsAutoSaving(false)
        }
        originalRef.current = [...blocks]
      }, 1000),
    [episode.id],
  )

  const handleTitleChange = useMemo(
    () =>
      debounce(async (title: string) => {
        try {
          setIsAutoSaving(true)
          await updateEpisode(episode.id, { title })
          setEpisode((prev) => ({ ...prev, title }))
          setIsAutoSaving(false)
        } catch (e) {
          console.error(e)
          toaster.error({
            title: "저장 실패",
            description: "제목을 저장하는 데 실패했습니다.",
          })
        }
      }, 1000),
    [episode.id],
  )

  return (
    <OptionProvider>
      <WidgetLayoutProvider>
        <EditorProvider>
          <EditorTemplate
            episode={episode}
            onBlocksChange={handleBlocksChange}
            onTitleChange={handleTitleChange}
            isAutoSaving={isAutoSaving}
          />
        </EditorProvider>
      </WidgetLayoutProvider>
    </OptionProvider>
  )
}

export default EditorPage
