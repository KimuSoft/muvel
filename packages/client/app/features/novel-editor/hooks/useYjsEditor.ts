import React, { useEffect, useRef } from "react"
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { keymap } from "prosemirror-keymap"
import { baseKeymap, toggleMark } from "prosemirror-commands"
import { redo, undo } from "prosemirror-history"
import { baseSchema } from "../schema/baseSchema"
import { blocksToYXmlElements, docToBlocks } from "../utils/blockConverter"
import { useEditorContext } from "../context/EditorContext"
import type { Block } from "muvel-api-types"
import { createInputRules } from "~/features/novel-editor/plugins/inputRules"
import { assignIdPlugin } from "~/features/novel-editor/plugins/assignIdPlugin"
import { autoQuotePlugin } from "~/features/novel-editor/plugins/autoQuotePlugin"
import { typewriterPlugin } from "~/features/novel-editor/plugins/typewriterPlugin"
import { highlightPlugin } from "~/features/novel-editor/plugins/highlightPlugin"
import { Fragment, Node as PMNode, Slice } from "prosemirror-model"
import { getEpisodeKey } from "~/db/yjsKeys"
import { IndexeddbPersistence } from "y-indexeddb"
import { ySyncPlugin, yUndoPlugin } from "y-prosemirror"
import * as Y from "yjs"

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
  const ydocRef = useRef(new Y.Doc())
  const initializedRef = useRef(false)

  const deleteIndexedDB = (name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase(name)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
      req.onblocked = () => {
        console.warn(`⚠️ IndexedDB "${name}" deletion blocked.`)
      }
    })
  }

  const initializeEditor = async (ydoc: Y.Doc) => {
    console.log(`[useEditor] episodeId: ${episodeId} initialised`)
    const dbName = getEpisodeKey(episodeId)
    await deleteIndexedDB(dbName)

    console.log("initialBlocks", initialBlocks)

    const yXmlFragment = ydoc.getXmlFragment("prosemirror")
    const elements = blocksToYXmlElements(initialBlocks, baseSchema)

    yXmlFragment.delete(0, yXmlFragment.length)
    yXmlFragment.insert(0, elements)

    const plugins = [
      ySyncPlugin(yXmlFragment),
      yUndoPlugin(),
      assignIdPlugin,
      createInputRules(baseSchema),
      autoQuotePlugin,
      typewriterPlugin,
      highlightPlugin(),
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
    ].filter(Boolean)

    const state = EditorState.create({ schema: baseSchema, plugins })

    const view = new EditorView(containerRef.current!, {
      state,
      editable: () => editable,
      handleDOMEvents: {
        keydown(view, event) {
          if ((event.ctrlKey || event.metaKey) && event.key === "z") {
            undo(view.state, view.dispatch)
            return true // ✅ 직접 처리했으니 true
          }
          return false
        },
      },
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

    const handleUpdate = () => {
      const newBlocks = docToBlocks(view.state.doc, episodeId)
      setBlocks(newBlocks)
      onChange?.(newBlocks)
    }

    ydoc.on("update", handleUpdate)

    new IndexeddbPersistence(dbName, ydoc)

    // 정리 함수 리턴
    return () => {
      ydoc.off("update", handleUpdate)
      view.destroy()
      setView(null)
      viewRef.current = null
    }
  }

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const ydoc = ydocRef.current

    let cleanup: (() => void) | undefined
    void initializeEditor(ydoc).then((fn) => {
      cleanup = fn
    })

    return () => {
      cleanup?.()
    }
  }, [])

  return {
    view: viewRef.current,
  }
}
