import { type RefObject, useEffect, useRef } from "react"
import * as Y from "yjs"
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { yCursorPlugin, ySyncPlugin, yUndoPlugin } from "y-prosemirror"
import { keymap } from "prosemirror-keymap"
import { baseKeymap } from "prosemirror-commands"
import { redo, undo } from "prosemirror-history"
import { IndexeddbPersistence } from "y-indexeddb"
import { Awareness } from "y-protocols/awareness"
import { baseSchema } from "../schema/baseSchema"
import { blocksToYXmlElements, docToBlocks } from "../utils/blockConverter"
import { getBlocksChange } from "../utils/calculateBlockChanges"
import { useEditorContext } from "../context/EditorContext"
import { createInputRules } from "../plugins/inputRules"
import { assignIdPlugin } from "../plugins/assignIdPlugin"
import { autoQuotePlugin } from "../plugins/autoQuotePlugin"
import { typewriterPlugin } from "../plugins/typewriterPlugin"
import { highlightPlugin } from "../plugins/highlightPlugin"
import type { Block } from "muvel-api-types"
import { debounce } from "lodash-es"
import { getEpisodeKey } from "~/db/yjsKeys"

interface UseEditorProps {
  containerRef: RefObject<HTMLDivElement>
  initialBlocks: Block[]
  episodeId: string
  editable?: boolean
  onChange?: (blocks: Block[]) => void
}

export const useEditor = ({
  initialBlocks,
  containerRef,
  episodeId,
  editable = true,
  onChange,
}: UseEditorProps) => {
  const { setView, setBlocks } = useEditorContext()
  const viewRef = useRef<EditorView | null>(null)
  const ydocRef = useRef(new Y.Doc())
  const initializedRef = useRef(false)

  // ⛳ IndexedDB 삭제 유틸
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

  // ⛳ 초기화 메인 로직
  const initializeEditor = async (ydoc: Y.Doc) => {
    console.log(`[useEditor] episodeId: ${episodeId} initialised`)
    const dbName = getEpisodeKey(episodeId)
    await deleteIndexedDB(dbName)

    console.log("initialBlocks", initialBlocks)

    const yXmlFragment = ydoc.getXmlFragment("prosemirror")
    const elements = blocksToYXmlElements(initialBlocks, baseSchema)
    yXmlFragment.delete(0, yXmlFragment.length)
    yXmlFragment.insert(0, elements)

    const awareness = new Awareness(ydoc)
    awareness.setLocalStateField("user", {
      name: "Kimu",
      color: "#ff88aa",
    })

    const plugins = [
      ySyncPlugin(yXmlFragment),
      yCursorPlugin(awareness),
      yUndoPlugin(),
      createInputRules(baseSchema),
      autoQuotePlugin,
      typewriterPlugin,
      highlightPlugin(),
      editable && assignIdPlugin,
      keymap({
        "Mod-z": undo,
        "Mod-y": redo,
        "Shift-Mod-z": redo,
      }),
      keymap(baseKeymap),
    ].filter(Boolean)

    const state = EditorState.create({ schema: baseSchema, plugins })

    const view = new EditorView(containerRef.current!, {
      state,
      editable: () => editable,
    })

    viewRef.current = view
    setView(view)

    // 🧠 debounce로 block diff 감지
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

  // 🎯 useEffect 안에서는 async 함수 호출만
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
