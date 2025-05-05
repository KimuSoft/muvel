import React, { useEffect, useRef } from "react"
import { Box } from "@chakra-ui/react"
import { useEditor } from "../hooks/useEditor"
import type { Block } from "muvel-api-types"
import "../style/editorStyles.css"
import { useOption } from "~/context/OptionContext"
import { toaster } from "~/components/ui/toaster"

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

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData("text/plain") ?? ""
      if (pastedText.includes("\n")) {
        toaster.info({
          title: "붙여넣기 팁",
          description:
            "소설 전체를 붙여넣는 게 의도대로 안 될 경우에는 Ctrl(CMD)+Shift+V를 사용해 보세요!",
        })
      }
    }

    window.addEventListener("paste", handlePaste)

    return () => {
      window.removeEventListener("paste", handlePaste)
    }
  }, [])

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
      w={"100%"}
      borderRadius="md"
      p={4}
      pb={"40vh"}
      spellCheck={false}
      tabIndex={0}
      color={{ base: "gray.700", _dark: "gray.300" }}
      style={
        {
          "--editor-line-height": options.lineHeight,
          "--editor-font-family": `${options.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Apple SD Gothic Neo', 'Noto Sans KR', Arial, sans-serif`,
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
