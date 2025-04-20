import React, { useRef } from "react"
import { Box } from "@chakra-ui/react"
import { useEditor } from "../hooks/useEditor"
import type { Block } from "muvel-api-types"
import "../style/editorStyles.css"
import { useOption } from "~/context/OptionContext"

interface NovelEditorProps {
  initialBlocks: Block[]
  episodeId: string
  editable?: boolean
  onChange?: (blocks: Block[]) => void // ✅ 변화된 내용만 넘김
}

const NovelEditor: React.FC<NovelEditorProps> = ({
  initialBlocks,
  episodeId,
  editable = true,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null!)
  const [options] = useOption()

  useEditor({
    containerRef,
    initialBlocks,
    episodeId,
    editable,
    onChange,
  })

  return (
    <Box
      className="ProseMirror"
      ref={containerRef}
      minH="300px"
      borderRadius="md"
      p={4}
      pb={"40vh"}
      tabIndex={0}
      color={{ base: "gray.700", _dark: "gray.300" }}
      style={
        {
          "--editor-line-height": options.lineHeight,
          "--editor-font-family": `'${options.fontFamily}'`,
          "--editor-font-weight": `${options.fontWeight}`,
          "--editor-font-size": `${options.fontSize}px`,
          "--editor-color": options.color,
          "--editor-indent": `${options.indent}em`,
          "--editor-block-gap": `${options.blockGap}px`,
        } as React.CSSProperties
      }
    />
  )
}

export default NovelEditor
