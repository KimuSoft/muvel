import { Plugin } from "prosemirror-state"

export const typewriterPlugin = new Plugin({
  view(editorView) {
    return {
      update(view, prevState) {
        const { state } = view

        // selection이 바뀐 경우만 처리
        if (state.selection.eq(prevState.selection)) return

        const domAtPos = view.domAtPos(state.selection.head)
        if (!domAtPos) return

        // 선택된 위치의 DOM 요소 찾기
        const dom =
          domAtPos.node.nodeType === 3
            ? domAtPos.node.parentElement
            : (domAtPos.node as HTMLElement)

        if (!dom || typeof dom.scrollIntoView !== "function") return

        // 뷰포트 중앙에 위치시키기 (스크롤 조정)
        const domRect = dom.getBoundingClientRect()
        const offset = domRect.top + window.scrollY - window.innerHeight / 2

        window.scrollTo({
          top: offset,
          behavior: "smooth",
        })
      },
    }
  },
})
