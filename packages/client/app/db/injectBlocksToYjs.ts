import * as Y from "yjs"
import { IndexeddbPersistence } from "y-indexeddb"
import { blocksToDoc } from "~/features/novel-editor/utils/blockConverter"
import { baseSchema } from "~/features/novel-editor/schema/baseSchema"
import { getEpisodeKey } from "~/db/yjsKeys"
import { EditorState } from "prosemirror-state"
import { ySyncPlugin, ySyncPluginKey } from "y-prosemirror"
import { EditorView } from "prosemirror-view"
import type { Block } from "muvel-api-types"

export async function injectBlocksToYjs(
  episodeId: string,
  blocks: Block[],
): Promise<Y.Doc> {
  const dbName = getEpisodeKey(episodeId)
  const ydoc = new Y.Doc()

  // 1. provider 생성 + DB 초기화
  const persistence = new IndexeddbPersistence(dbName, ydoc)
  await persistence.whenSynced
  await persistence.clearData()

  // 2. blocks → ProseMirror doc
  const safeBlocks = blocks.map((block) => ({
    ...block,
    content: Array.isArray(block.content) ? block.content : [],
  }))
  const doc = blocksToDoc(safeBlocks, baseSchema)
  const fragment = ydoc.getXmlFragment("prosemirror")

  // 3. ProseMirror ↔ Yjs 바인딩
  const state = EditorState.create({
    schema: baseSchema,
    doc,
    plugins: [ySyncPlugin(fragment)],
  })
  const view = new EditorView(document.createElement("div"), { state })

  try {
    // 초기 변경 사항 강제 전파
    ySyncPluginKey.getState(state)?.binding?._prosemirrorChanged()

    // 한 프레임 기다리면 IndexedDB 쓰기까지 끝남
    await new Promise(requestAnimationFrame)
  } finally {
    view.destroy()
    await persistence.destroy() // destroy 가 pending write 도 마무리
  }

  return ydoc
}
