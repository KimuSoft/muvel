import { Plugin } from "prosemirror-state"

export const assignIdPlugin = new Plugin({
  appendTransaction(transactions, oldState, newState) {
    const tr = newState.tr
    let modified = false

    newState.doc.descendants((node, pos) => {
      const typeName = node.type.name
      const needsId =
        node.type.isBlock && !node.attrs.id && typeof node.attrs === "object"

      if (needsId) {
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          id: crypto.randomUUID(),
        })
        modified = true
      }
    })

    return modified ? tr : null
  },
})
