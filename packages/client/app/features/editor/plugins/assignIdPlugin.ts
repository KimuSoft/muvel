import { Plugin } from "prosemirror-state"

export const assignIdPlugin = new Plugin({
  appendTransaction(transactions, oldState, newState) {
    // 문서에 변경 없으면 무시
    const docChanged = transactions.some((tr) => tr.docChanged)
    if (!docChanged) return null

    const tr = newState.tr
    let modified = false
    const seenIds = new Set<string>()

    newState.doc.descendants((node, pos) => {
      if (!node.type.isBlock || typeof node.attrs !== "object") return

      const nodeId = node.attrs.id
      const needsNewId = !nodeId || seenIds.has(nodeId)

      if (needsNewId) {
        const newId = crypto.randomUUID()
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          id: newId,
        })
        seenIds.add(newId)
        modified = true
      } else {
        seenIds.add(nodeId)
      }
    })

    return modified ? tr : null
  },
})
