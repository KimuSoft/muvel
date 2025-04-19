import type { Block, GetEpisodeResponseDto } from "muvel-api-types"
import React, { useMemo } from "react"
import NovelEditor from "~/features/editor/components/NovelEditor"
import { Button, Center, ClientOnly, Container } from "@chakra-ui/react"
import { useEditorContext } from "~/features/editor/context/EditorContext"
import type { BlockChange } from "~/features/editor/utils/calculateBlockChanges"
import { updateEpisodeBlocks } from "~/api/api.episode"
import { debounce } from "lodash-es"
import OptionDrawer from "~/features/editor/components/OptionDrawer"

const EditorTemplate: React.FC<{ episode: GetEpisodeResponseDto }> = ({
  episode,
}) => {
  const { view, getBlocks } = useEditorContext()

  const [blocks, setBlocks] = React.useState<Block[]>([])

  const handleChange = useMemo(
    () =>
      debounce(async (blocks: BlockChange[]) => {
        await updateEpisodeBlocks(episode.id, blocks)
      }, 1000),
    [episode.id],
  )

  return (
    <Center>
      <Container maxW={"4xl"} my={100} px={3}>
        <OptionDrawer />
        <ClientOnly>
          <NovelEditor
            initialBlocks={episode.blocks}
            episodeId={episode.id}
            editable={episode.permissions.edit}
            onChange={handleChange}
          />
        </ClientOnly>
        <Button onClick={() => setBlocks(getBlocks())}>Refresh</Button>
        <pre>{JSON.stringify(blocks, null, 2)}</pre>
        <pre>{JSON.stringify(episode, null, 2)}</pre>
      </Container>
    </Center>
  )
}

export default EditorTemplate
