import { EditorState, Plugin, TextSelection } from "prosemirror-state"
import { EditorView } from "prosemirror-view"

// --- isPrecededByWhitespaceOrStart, isFollowedByWhitespaceOrEnd 함수는 그대로 유지 ---
// ... (이전 코드와 동일) ...
function isPrecededByWhitespaceOrStart(
  state: EditorState,
  pos: number,
): boolean {
  if (pos === 0) {
    return true
  }
  const $pos = state.doc.resolve(pos)
  if ($pos.parentOffset === 0) {
    return true
  }
  const charBefore = state.doc.textBetween(Math.max(0, $pos.pos - 1), $pos.pos)
  return /^\s$/.test(charBefore)
}

function isFollowedByWhitespaceOrEnd(state: EditorState, pos: number): boolean {
  const $pos = state.doc.resolve(pos)
  const parent = $pos.parent
  const docSize = state.doc.content.size
  // 현재 노드 끝 확인
  if ($pos.parentOffset === parent.content.size) {
    return true
  }
  // 문서 끝 확인
  if (pos === docSize) {
    return true
  }
  const charAfter = state.doc.textBetween(pos, Math.min(pos + 1, docSize))
  return /^\s$/.test(charAfter) || charAfter === "" // 공백 또는 내용 없음 확인
}

// --- 따옴표 쌍 정의 ---
const quotePairs: ReadonlyArray<[string, string]> = [
  ["‘", "’"], // Single typographic quotes
  ["“", "”"], // Double typographic quotes
]

// 닫는 따옴표만 따로 추출 (Enter 키 로직에서 사용)
const closingQuotes = quotePairs.map((pair) => pair[1])

export const autoQuotePlugin = new Plugin({
  props: {
    // --- handleTextInput은 이전과 동일 ---
    handleTextInput(
      // ... (이전 코드와 동일) ...
      view: EditorView,
      from: number,
      to: number,
      text: string,
    ): boolean {
      const quoteMap: Record<string, [string, string]> = {
        "'": ["‘", "’"],
        '"': ["“", "”"],
      }

      if (text in quoteMap) {
        const { state, dispatch } = view
        const shouldActivatePair =
          isPrecededByWhitespaceOrStart(state, from) &&
          isFollowedByWhitespaceOrEnd(state, to)

        if (shouldActivatePair) {
          const [openQuote, closeQuote] = quoteMap[text]
          const { tr } = state
          tr.replaceRangeWith(
            from,
            to,
            state.schema.text(openQuote + closeQuote),
          )
          tr.setSelection(TextSelection.create(tr.doc, from + openQuote.length))
          dispatch(tr)
          return true
        }
      }
      return false
    },

    // --- handleKeyDown 수정 ---
    handleKeyDown(view: EditorView, event: KeyboardEvent): boolean {
      const { state } = view
      const { selection, doc } = state
      const { from } = selection

      // 1. Backspace 키 로직 (이전과 동일)
      if (event.key === "Backspace" && selection.empty) {
        if (from === 0) {
          return false
        }
        const charBefore = doc.textBetween(from - 1, from)
        // Backspace 로직에서는 charAfter가 필요하지만, 안전하게 경계 처리
        const charAfter = doc.textBetween(
          from,
          Math.min(from + 1, doc.content.size),
        )

        for (const [openQuote, closeQuote] of quotePairs) {
          if (charBefore === openQuote && charAfter === closeQuote) {
            event.preventDefault()
            const tr = state.tr.delete(from - 1, from + 1)
            view.dispatch(tr)
            return true
          }
        }
      }

      // 2. Enter 키 로직 (요구사항에 맞게 수정)
      if (event.key === "Enter" && selection.empty) {
        const $pos = doc.resolve(from) // 현재 커서 위치 resolve
        // 커서 다음 문자를 가져옴 (문서 끝 경계 처리 포함)
        const charAfter = doc.textBetween(
          from,
          Math.min(from + 1, doc.content.size),
        )

        // 조건 확인:
        // 1. 커서 다음 문자가 닫는 따옴표인가?
        // 2. 해당 닫는 따옴표가 현재 블록 노드의 마지막 문자인가?
        //    ($pos.parentOffset은 커서의 오프셋, 여기에 +1 해야 따옴표의 끝 오프셋)
        if (
          charAfter && // charAfter가 존재하는지 확인 (커서가 문서 맨 끝이 아닌 경우)
          closingQuotes.includes(charAfter) &&
          $pos.parentOffset + 1 === $pos.parent.content.size
        ) {
          event.preventDefault() // 기본 Enter 동작 방지

          const endOfBlock = $pos.end() // 현재 블록 노드가 끝나는 위치
          // 삽입할 새 노드 타입 결정 (기본은 paragraph, 아니면 현재 블록과 같은 타입)
          const newNodeType = state.schema.nodes.paragraph || $pos.parent.type
          const newNode = newNodeType.createAndFill() // 빈 새 노드 생성

          if (newNode) {
            const tr = state.tr.insert(endOfBlock, newNode) // 현재 블록 뒤에 새 노드 삽입
            // 새로 삽입된 노드의 시작 위치(+1)로 커서 이동
            const newSelectionPos = endOfBlock + 1
            tr.setSelection(TextSelection.create(tr.doc, newSelectionPos))
            view.dispatch(tr) // 트랜잭션 적용
            return true // 이벤트 처리 완료
          }
        }
      }

      // 위 조건들에 해당하지 않으면 false 반환하여 기본 동작 수행
      return false
    },
  },
})
