import * as Y from "yjs"
import { IndexeddbPersistence } from "y-indexeddb"
import { EditorState } from "prosemirror-state"
import { ySyncPlugin } from "y-prosemirror"
import { baseSchema } from "~/features/novel-editor/schema/baseSchema"
import { docToBlocks } from "~/features/novel-editor/utils/blockConverter"
import type { Block } from "muvel-api-types"
import { getEpisodeKey } from "~/db/yjsKeys"
import { EditorView } from "prosemirror-view"

export async function loadYjsBlocks(
  episodeId: string,
): Promise<{ blocks: Block[]; ydoc: Y.Doc }> {
  const ydoc = new Y.Doc()
  const provider = new IndexeddbPersistence(getEpisodeKey(episodeId), ydoc)

  await new Promise<void>((resolve) => {
    provider.once("synced", resolve)
  })

  const fragment = ydoc.getXmlFragment("prosemirror")

  const isEmpty = ydoc.get("prosemirror")?.toJSON()?.length === 0
  if (isEmpty) {
    return { blocks: [], ydoc }
  }

  const state = EditorState.create({
    schema: baseSchema,
    plugins: [ySyncPlugin(fragment)],
  })

  // 필요한 경우: 플러그인 키로 업데이트 강제 트리거도 가능

  const view = new EditorView(document.createElement("div"), {
    state,
  })

  await new Promise((resolve) => setTimeout(resolve, 0)) // 한 틱 대기

  const blocks = docToBlocks(view.state.doc, episodeId)
  return { blocks, ydoc }
}
