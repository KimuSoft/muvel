// 🗂  app/features/novel-editor/hooks/useCollabEditor.ts
// -----------------------------------------------------------------------------
// Fully‑integrated collaboration hook.
//  •   Keeps **모든** 기존 ProseMirror 플러그인 intact
//  •   Adds Yjs real‑time sync (WebSocket + IndexedDB)
// -----------------------------------------------------------------------------

import { type RefObject, useEffect, useRef, useState } from "react"
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
import { createInputRules } from "../plugins/inputRules"
import { assignIdPlugin } from "../plugins/assignIdPlugin"
import { autoQuotePlugin } from "../plugins/autoQuotePlugin"
import { typewriterPlugin } from "../plugins/typewriterPlugin"
import { highlightPlugin } from "../plugins/highlightPlugin"
import { docToBlocks } from "../utils/blockConverter"
import { debounce } from "lodash-es"
import type { Block } from "muvel-api-types"
import { MuvelIoProvider } from "~/networks/muvelIoProvider"
import { getEpisodeKey } from "~/db/yjsKeys"

interface UseCollabProps {
  containerRef: RefObject<HTMLDivElement>
  episodeId: string
  editable?: boolean
  onChange?: (blocks: Block[]) => void
}

export function useCollabEditor({
  containerRef,
  episodeId,
  editable = true,
  onChange,
}: UseCollabProps) {
  // ───────────────────────── refs & state
  const viewRef = useRef<EditorView | null>(null)
  const ydocRef = useRef<Y.Doc>(new Y.Doc())
  const [status, setStatus] = useState<"connected" | "disconnected">(
    "disconnected",
  )

  // ───────────────────────── effect – initialise once per episode
  useEffect(() => {
    console.log(`[useCollabEditor] episodeId: ${episodeId} initialised`)
    const ydoc = ydocRef.current
    const fragment = ydoc.getXmlFragment("prosemirror")

    /* 1️⃣ Offline cache (IndexedDB) */
    const persistence = new IndexeddbPersistence(getEpisodeKey(episodeId), ydoc)

    /* 2️⃣ Awareness & WebSocket provider */
    const awareness = new Awareness(ydoc)
    awareness.setLocalStateField("user", {
      name: "Anonymous", // TODO: inject real user
      color: "#ff88aa",
    })
    const provider = new MuvelIoProvider(episodeId, ydoc)
    // provider.on("status", setStatus)

    /* 3️⃣ Compose plugin array – include ALL existing plugins */
    const plugins = [
      ySyncPlugin(fragment),
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

    /* 4️⃣ Editor state + view */
    const state = EditorState.create({ schema: baseSchema, plugins })
    const view = new EditorView(containerRef.current!, {
      state,
      editable: () => editable,
    })
    viewRef.current = view

    /* 5️⃣ Block[] preview callback (UI only) */
    const emitBlocks = debounce(() => {
      const blocks = docToBlocks(view.state.doc, episodeId)
      onChange?.(blocks)
    }, 500)
    ydoc.on("update", emitBlocks)

    // ─ cleanup
    return () => {
      ydoc.off("update", emitBlocks)
      view.destroy()
      provider.destroy()
      void persistence.destroy()
    }
  }, [containerRef, episodeId, editable, onChange])

  return { view: viewRef.current, status }
}
