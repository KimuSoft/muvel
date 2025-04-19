import type { GetEpisodeResponseDto } from "muvel-api-types"
import React from "react"
import EditorTemplate from "~/features/editor/EditorTemplate"
import { EditorProvider } from "~/features/editor/context/EditorContext"
import OptionProvider from "~/providers/OptionProvider"

const EditorPage: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode,
}) => {
  return (
    <OptionProvider>
      <EditorProvider>
        <EditorTemplate episode={episode} />
      </EditorProvider>
    </OptionProvider>
  )
}

export default EditorPage
