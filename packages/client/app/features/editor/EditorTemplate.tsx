import type { GetEpisodeResponseDto } from "muvel-api-types"
import React, { useMemo } from "react"
import NovelEditor from "~/features/editor/components/NovelEditor"
import { ClientOnly, Container, VStack } from "@chakra-ui/react"
import type { BlockChange } from "~/features/editor/utils/calculateBlockChanges"
import { updateEpisodeBlocks } from "~/api/api.episode"
import { debounce } from "lodash-es"
import { useOption } from "~/context/OptionContext"
import EditorHeader from "~/features/editor/components/EditorHeader"

const EditorTemplate: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode,
}) => {
  // const { view, getBlocks } = useEditorContext()
  const [option] = useOption()

  const handleChange = useMemo(
    () =>
      debounce(async (blocks: BlockChange[]) => {
        await updateEpisodeBlocks(episode.id, blocks)
      }, 1000),
    [episode.id],
  )

  return (
    <VStack
      bgColor={option.backgroundColor || undefined}
      transition="background-color 0.2s ease-in-out"
      minH={"100vh"}
      h={"100%"}
    >
      <EditorHeader
        novelId={episode.novelId}
        transition="background-color 0.2s ease-in-out"
        bgColor={"inherit"}
      />
      <Container
        maxW={option.editorMaxWidth}
        transition="max-width 0.2s ease-in-out"
        minH={"100%"}
        my={100}
        px={3}
      >
        <ClientOnly>
          <NovelEditor
            initialBlocks={episode.blocks}
            episodeId={episode.id}
            editable={episode.permissions.edit}
            onChange={handleChange}
          />
        </ClientOnly>
      </Container>
    </VStack>
  )
}

export default EditorTemplate
