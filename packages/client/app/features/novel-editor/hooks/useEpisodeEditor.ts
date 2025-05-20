import React, { useEffect, useRef } from "react"
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { keymap } from "prosemirror-keymap"
import { baseKeymap, toggleMark } from "prosemirror-commands"
import { history, redo, undo } from "prosemirror-history"
import { baseSchema } from "../schema/baseSchema"
import { blocksToDoc } from "../utils/blockConverter"
import { useEditorContext } from "../context/EditorContext"
import { type EpisodeBlock, EpisodeBlockType } from "muvel-api-types"
import { createInputRules } from "~/features/novel-editor/plugins/inputRules"
import { assignIdPlugin } from "~/features/novel-editor/plugins/assignIdPlugin"
import { autoQuotePlugin } from "~/features/novel-editor/plugins/autoQuotePlugin"
import { typewriterPlugin } from "~/features/novel-editor/plugins/typewriterPlugin"
import { highlightPlugin } from "~/features/novel-editor/plugins/highlightPlugin"
import { Fragment, Node as PMNode, Slice } from "prosemirror-model"
import { placeholderPlugin } from "~/features/novel-editor/plugins/placeholderPlugin"
import { getAppOptions } from "~/features/novel-editor/utils/getAppOptions"
import { pastePlugin } from "~/features/novel-editor/plugins/pastePlugin"

interface UseEpisodeEditorProps {
  containerRef: React.RefObject<HTMLDivElement>
  initialBlocks: EpisodeBlock[]
  episodeId: string
  editable?: boolean
  onDocUpdate?: (doc: PMNode) => void
  onStateChange?: (state: EditorState) => void
}

export const useEpisodeEditor = ({
  containerRef,
  initialBlocks,
  episodeId,
  editable = true,
  onDocUpdate,
  onStateChange,
}: UseEpisodeEditorProps) => {
  const { setView } = useEditorContext()
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (viewRef.current) return

    const doc = blocksToDoc(
      initialBlocks.length
        ? initialBlocks
        : [
            {
              id: crypto.randomUUID() as string,
              blockType: EpisodeBlockType.Describe,
              content: [],
              text: "",
              order: 0,
              attr: {},
            },
          ],
      baseSchema,
    )

    const state = EditorState.create({
      schema: baseSchema,
      doc,
      plugins: [
        history({ newGroupDelay: 100 }),
        pastePlugin(),
        assignIdPlugin,
        createInputRules(baseSchema),
        autoQuotePlugin,
        typewriterPlugin,
        highlightPlugin(),
        placeholderPlugin,
        keymap({
          "Mod-z": undo,
          "Mod-y": redo,
          "Shift-Mod-z": redo, // mac 호환
          "Mod-b": toggleMark(baseSchema.marks.strong), // Bold
          "Mod-i": toggleMark(baseSchema.marks.em), // Italic
          "Mod-u": toggleMark(baseSchema.marks.underline), // Underline (스키마에 있다면)
          "Mod-`": toggleMark(baseSchema.marks.code), // Inline code
          "Shift-Enter": (state, dispatch) => {
            const br = state.schema.nodes["hard_break"]
            if (!br) return false

            dispatch?.(
              state.tr.replaceSelectionWith(br.create()).scrollIntoView(),
            )
            return true
          },
          ...baseKeymap,
        }),
      ],
    })

    const view = new EditorView(containerRef.current, {
      state,
      editable: () => editable,
      dispatchTransaction(tr) {
        const newState = view.state.apply(tr)
        view.updateState(newState)
        onStateChange?.(newState)
        if (tr.docChanged) {
          onDocUpdate?.(newState.doc)
        }
      },
      handleDOMEvents: {
        keydown(view, event) {
          if ((event.ctrlKey || event.metaKey) && event.key === "z") {
            undo(view.state, view.dispatch)
            return true
          }
          return false
        },
      },
      // PM 에디터에서 복사 시 줄바꿈 유지 용도
      clipboardTextSerializer: (slice) => {
        const options = getAppOptions()

        return slice.content.textBetween(
          0,
          slice.content.size,
          "\n".repeat((options?.exportSettings?.paragraphSpacing || 0) + 1),
          (node) => {
            if (node.type.name === "hard_break") {
              return "\n"
            }
            // 다른 인라인 노드 중 텍스트 표현이 필요한 경우 추가
            return node.textContent
          },
        )
      },
      // 복사 시 PM 노드의 id 속성 제거
      transformCopied(slice) {
        const transformer = (node: PMNode): PMNode => {
          if (node.type.isBlock && node.attrs.id) {
            const { id, ...rest } = node.attrs
            return (
              node.type.createAndFill(rest, node.content, node.marks) || node
            )
          }

          const newContent = Fragment.from(
            node.content.content.map(transformer),
          )
          return node.copy(newContent)
        }

        const transformed = Fragment.from(
          slice.content.content.map(transformer),
        )
        return new Slice(transformed, slice.openStart, slice.openEnd)
      },
    })

    viewRef.current = view
    setView(view)

    return () => {
      view.destroy()
      setView(null)
      viewRef.current = null
    }
  }, [containerRef, initialBlocks, episodeId, editable])

  return {
    view: viewRef.current,
  }
}
