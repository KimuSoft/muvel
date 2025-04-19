import React, { useRef } from "react"
import { Box, ClientOnly } from "@chakra-ui/react"
import { useEditor } from "../hooks/useEditor"
import type { Block } from "muvel-api-types"
import {
  type BlockChange,
  getBlocksChange,
} from "~/features/editor/utils/calculateBlockChanges"
import { debounce } from "lodash-es"
import "../style/editorStyles.css"
import { useOption } from "~/context/OptionContext"

interface NovelEditorProps {
  initialBlocks: Block[]
  episodeId: string
  editable?: boolean
  onChange?: (changes: BlockChange[]) => void // ✅ 변화된 내용만 넘김
}

const NovelEditor: React.FC<NovelEditorProps> = ({
  initialBlocks,
  episodeId,
  editable = true,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null!)
  const originalRef = useRef<Block[]>(initialBlocks)
  const [options] = useOption()

  useEditor({
    containerRef,
    initialBlocks,
    episodeId,
    editable,
    onChange: debounce((currentBlocks) => {
      const changes = getBlocksChange(originalRef.current, currentBlocks)

      if (changes.length) {
        console.log(originalRef.current)
        console.log(currentBlocks)
        console.log("changes", changes)
        onChange?.(changes)
        originalRef.current = [...currentBlocks]
      } else {
        console.log("no changes")
      }
    }, 1000),
  })

  return (
    <Box
      className="ProseMirror"
      ref={containerRef}
      minH="300px"
      borderRadius="md"
      p={4}
      tabIndex={0}
      style={
        {
          "--editor-line-height": options.lineHeight,
          "--editor-font-family": `'${options.fontFamily}'`,
          "--editor-font-size": `${options.fontSize}px`,
          "--editor-color": options.color,
          // "--editor-line-height": "1.2",
          // "--editor-font-family": `'RIDIBatang', 'Montserrat', 'Pretendard', 'Noto Sans KR', sans-serif`,
          // "--editor-font-weight": "400",
          // "--editor-font-size": `20px`,
          // "--editor-color": "white",
          // "--quote-color": options.quoteColor,
        } as React.CSSProperties
      }
    />
  )
}

export default NovelEditor
