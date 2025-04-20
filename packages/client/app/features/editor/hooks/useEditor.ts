import React, { useEffect, useRef } from "react"
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { keymap } from "prosemirror-keymap"
import { baseKeymap, toggleMark } from "prosemirror-commands"
import { history, redo, undo } from "prosemirror-history"
import { baseSchema } from "../schema/baseSchema"
import { blocksToDoc, docToBlocks } from "../utils/blockConverter"
import { useEditorContext } from "../context/EditorContext"
import type { Block } from "muvel-api-types"
import { createInputRules } from "~/features/editor/plugins/inputRules"
import { assignIdPlugin } from "~/features/editor/plugins/assignIdPlugin"
import { autoQuotePlugin } from "~/features/editor/plugins/autoQuotePlugin"
import { typewriterPlugin } from "~/features/editor/plugins/typewriterPlugin"

interface UseEditorProps {
  containerRef: React.RefObject<HTMLDivElement>
  initialBlocks: Block[]
  episodeId: string
  editable?: boolean
  onChange?: (blocks: Block[]) => void
}

export const useEditor = ({
  containerRef,
  initialBlocks,
  episodeId,
  editable = true,
  onChange,
}: UseEditorProps) => {
  const { setView, setBlocks } = useEditorContext()
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (viewRef.current) return // ✅ 에디터 중복 생성 방지

    const doc = blocksToDoc(initialBlocks, baseSchema)

    const state = EditorState.create({
      schema: baseSchema,
      doc,
      plugins: [
        history(),
        assignIdPlugin,
        createInputRules(baseSchema),
        autoQuotePlugin,
        typewriterPlugin,
        keymap({
          "Mod-z": undo,
          "Mod-y": redo,
          "Shift-Mod-z": redo, // mac 호환
          "Mod-b": toggleMark(baseSchema.marks.strong), // Bold
          "Mod-i": toggleMark(baseSchema.marks.em), // Italic
          "Mod-u": toggleMark(baseSchema.marks.underline), // Underline (스키마에 있다면)
          "Mod-`": toggleMark(baseSchema.marks.code), // Inline code
        }),
        keymap(baseKeymap),
      ],
    })

    const view = new EditorView(containerRef.current, {
      state,
      editable: () => editable,
      dispatchTransaction(tr) {
        const newState = view.state.apply(tr)
        view.updateState(newState)

        const updatedBlocks = docToBlocks(newState.doc, episodeId)
        setBlocks(updatedBlocks)
        onChange?.(updatedBlocks)
      },
      handleDOMEvents: {
        keydown(view, event) {
          if ((event.ctrlKey || event.metaKey) && event.key === "z") {
            undo(view.state, view.dispatch)
            return true // ✅ 직접 처리했으니 true
          }
          return false
        },
      },
    })

    viewRef.current = view
    setView(view) // ✅ 최초 한 번만 등록

    return () => {
      view.destroy()
      setView(null)
      viewRef.current = null
    }
  }, []) // ✅ 빈 배열로 useEffect 고정 (절대 view나 setView 넣지 마)

  return {
    view: viewRef.current,
  }
}
