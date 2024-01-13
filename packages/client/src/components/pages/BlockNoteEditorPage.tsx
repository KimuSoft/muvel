import React, { useState } from "react"
import BlockNoteEditorTemplate from "../templates/BlockNoteEditorTemplate"
import { Block as BlockNoteBlock, BlockNoteEditor } from "@blocknote/core"
import { useMediaQuery } from "@chakra-ui/react"

const BlockNoteEditorPage: React.FC = () => {
  const [blockNoteBlocks, setBlockNoteBlocks] = useState<BlockNoteBlock[]>([])

  const onEditorContentChange = (blocks: BlockNoteEditor) => {
    setBlockNoteBlocks(blocks.topLevelBlocks)
    console.log(JSON.stringify(blocks.topLevelBlocks, null, 2))
  }

  return (
    <BlockNoteEditorTemplate onEditorContentChange={onEditorContentChange} />
  )
}

export default BlockNoteEditorPage
