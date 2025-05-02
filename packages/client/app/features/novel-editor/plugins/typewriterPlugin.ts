import { Plugin } from "prosemirror-state"
import { EditorView } from "prosemirror-view" // EditorView import 추가 (update 함수 타입 명시 위해)

export const typewriterPlugin = new Plugin({
  view(editorView) {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    // editorView 인자는 PluginView 생성 시 주입됨
    if (isMobile) return {} // 모바일이면 아무것도 안 함

    return {
      update(view: EditorView, prevState) {
        const { state } = view
        const { selection } = state // selection을 변수로 추출

        // 1. selection이 바뀐 경우만 처리
        if (selection.eq(prevState.selection)) return

        // 2. ***추가된 조건***: selection이 비어있는 경우(커서 상태)에만 스크롤 실행
        // selection.empty가 false이면 (즉, 여러 문자가 선택된 경우) 여기서 중단
        if (!selection.empty) return

        // --- 이하 로직은 selection이 empty일 때만 실행됨 ---

        const domAtPos = view.domAtPos(selection.head) // selection.head 사용
        if (!domAtPos) return

        // 선택된 위치의 DOM 요소 찾기 (텍스트 노드일 경우 부모 요소 사용)
        const dom =
          domAtPos.node.nodeType === Node.TEXT_NODE // 명확성을 위해 Node.TEXT_NODE 사용
            ? domAtPos.node.parentElement
            : (domAtPos.node as HTMLElement)

        // dom 요소가 유효하고, getBoundingClientRect를 호출할 수 있는지 확인
        if (!dom || typeof dom.getBoundingClientRect !== "function") return

        try {
          // 뷰포트 중앙에 위치시키기 (스크롤 조정)
          const domRect = dom.getBoundingClientRect()
          // 요소의 화면상 top 위치 + 현재 스크롤 위치 - 뷰포트 높이의 절반 = 중앙 목표 스크롤 위치
          const targetScrollY =
            window.scrollY + domRect.top - window.innerHeight / 2

          window.scrollTo({
            top: targetScrollY,
            behavior: "smooth",
          })
        } catch (error) {
          // getBoundingClientRect 등에서 예외 발생 가능성 처리
          console.error("Typewriter scroll failed:", error)
        }
      },
    }
  },
})
