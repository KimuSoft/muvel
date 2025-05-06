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
import { blocksToDoc, docToBlocks } from "../utils/blockConverter"
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
  containerRef,
  initialBlocks,
  episodeId,
  editable = true,
  onChange,
}: UseEditorProps) => {
  const { setView, setBlocks } = useEditorContext()
  const viewRef = useRef<EditorView | null>(null)
  const ydocRef = useRef(new Y.Doc())
  const prevBlocksRef = useRef<Block[]>(initialBlocks)
  const initialDocRef = useRef<ReturnType<typeof blocksToDoc> | null>(null)

  useEffect(() => {
    const ydoc = ydocRef.current
    const yXmlFragment = ydoc.getXmlFragment("prosemirror")

    // 로컬 저장소 연동
    const persistence = new IndexeddbPersistence(getEpisodeKey(episodeId), ydoc)
    persistence.on("synced", () => {
      console.log("✅ Yjs IndexedDB 동기화 완료")
    })

    // 최초 로딩 시 Yjs 문서 초기화 (이미 존재하면 무시)
    if (yXmlFragment.length === 0) {
      initialDocRef.current = blocksToDoc(initialBlocks, baseSchema)
    }

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

    const state = EditorState.create({
      schema: baseSchema,
      doc: initialDocRef.current ?? undefined,
      plugins,
    })

    const view = new EditorView(containerRef.current!, {
      state,
      editable: () => editable,
    })

    viewRef.current = view
    setView(view)

    const handleUpdate = debounce(() => {
      const newBlocks = docToBlocks(view.state.doc, episodeId)
      const diff = getBlocksChange(prevBlocksRef.current, newBlocks)
      if (diff.length > 0) {
        prevBlocksRef.current = newBlocks
        setBlocks(newBlocks)
        onChange?.(newBlocks)
      }
    }, 500)

    ydoc.on("update", handleUpdate)

    return () => {
      ydoc.off("update", handleUpdate)
      view.destroy()
      setView(null)
      viewRef.current = null
    }
  }, [])

  return {
    view: viewRef.current,
  }
}
