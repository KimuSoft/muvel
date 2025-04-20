import type { Block, GetEpisodeResponseDto } from "muvel-api-types"
import React, { useMemo, useRef } from "react"
import EditorTemplate from "~/features/editor/EditorTemplate"
import { EditorProvider } from "~/features/editor/context/EditorContext"
import OptionProvider from "~/providers/OptionProvider"
import { debounce } from "lodash-es"
import { getBlocksChange } from "~/features/editor/utils/calculateBlockChanges"
import { updateEpisodeBlocks } from "~/api/api.episode"
import { toaster } from "~/components/ui/toaster"

const EditorPage: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode,
}) => {
  const originalRef = useRef<Block[]>(episode.blocks)
  const [isAutoSaving, setIsAutoSaving] = React.useState(false)

  const handleChange = useMemo(
    () =>
      debounce(async (blocks: Block[]) => {
        const changes = getBlocksChange(originalRef.current, blocks)
        if (!changes.length) return null
        console.log("시작~")
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
          console.log("끝~")
          setIsAutoSaving(false)
        }
        originalRef.current = [...blocks]
      }, 1000),
    [episode.id],
  )

  return (
    <OptionProvider>
      <EditorProvider>
        <EditorTemplate
          episode={episode}
          onChange={handleChange}
          isAutoSaving={isAutoSaving}
        />
      </EditorProvider>
    </OptionProvider>
  )
}

export default EditorPage
