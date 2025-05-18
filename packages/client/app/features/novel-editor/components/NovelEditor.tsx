import React, { useEffect, useRef } from "react"
import { Box } from "@chakra-ui/react"
import { useEpisodeEditor } from "../hooks/useEpisodeEditor"
import type { Block } from "muvel-api-types"
import "../style/editorStyles.css"
import { toaster } from "~/components/ui/toaster"
import { Node as PMNode } from "prosemirror-model"
import { useEditorStyleOptions } from "~/hooks/useAppOptions"

interface NovelEditorProps {
  initialBlocks: Block[]
  episodeId: string
  editable?: boolean
  onChange?: (doc: PMNode) => void
}

const NovelEditor: React.FC<NovelEditorProps> = ({
  initialBlocks,
  episodeId,
  editable = true,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null!)
  const [editorStyle] = useEditorStyleOptions()

  const pasteAlertFlagRef = useRef(false)

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData("text/plain") ?? ""
      if (pastedText.includes("\n") && !pasteAlertFlagRef.current) {
        toaster.info({
          title: "붙여넣기 팁",
          description:
            "소설 전체를 붙여넣는 게 의도대로 안 될 경우에는 Ctrl(CMD)+Shift+V를 사용해 보세요!",
        })
        pasteAlertFlagRef.current = true
      }
    }

    window.addEventListener("paste", handlePaste)

    return () => {
      window.removeEventListener("paste", handlePaste)
    }
  }, [])

  useEpisodeEditor({
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
      p={0}
      pb={"40vh"}
      spellCheck={false}
      tabIndex={0}
      color={{ base: "gray.700", _dark: "gray.300" }}
      style={
        {
          "--editor-line-height": editorStyle.lineHeight,
          "--editor-font-family": `${editorStyle.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Apple SD Gothic Neo', 'Noto Sans KR', Arial, sans-serif`,
          "--editor-font-weight": `${editorStyle.fontWeight}`,
          "--editor-font-size": `${editorStyle.fontSize}px`,
          "--editor-color": editorStyle.color,
          "--editor-indent": `${editorStyle.indent}em`,
          "--editor-block-gap": `${editorStyle.blockGap}px`,
        } as React.CSSProperties
      }
    />
  )
}

export default NovelEditor
