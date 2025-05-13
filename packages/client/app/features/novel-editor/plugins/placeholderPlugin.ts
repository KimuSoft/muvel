import { Plugin } from "prosemirror-state"
import { Decoration, DecorationSet } from "prosemirror-view"

export const placeholderPlugin = new Plugin({
  props: {
    decorations(state) {
      const { doc } = state

      // 문서가 오직 빈 paragraph 하나만 포함할 때
      if (doc.childCount <= 1 && doc.firstChild?.content.size === 0) {
        const decorations = [
          Decoration.node(0, doc.firstChild.nodeSize, {
            class: "placeholder",
            style: "--placeholder-text: '이야기를 시작해 보세요…';",
          }),
        ]
        return DecorationSet.create(doc, decorations)
      }

      return null
    },
  },
})
