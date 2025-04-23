import { Plugin, TextSelection, EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"

// --- isPrecededByWhitespaceOrStart, isFollowedByWhitespaceOrEnd 함수는 그대로 유지 ---
/**
 * Checks if the character before the given position is whitespace or
 * if the position is at the very beginning of its parent node.
 * ... (이전 코드와 동일) ...
 */
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

/**
 * Checks if the character after the given position is whitespace or
 * if the position is at the very end of its parent node.
 * ... (이전 코드와 동일) ...
 */
function isFollowedByWhitespaceOrEnd(state: EditorState, pos: number): boolean {
  const $pos = state.doc.resolve(pos)
  const parent = $pos.parent
  const docSize = state.doc.content.size
  if ($pos.parentOffset === parent.content.size) {
    return true
  }
  if (pos === docSize) {
    return true
  }
  const charAfter = state.doc.textBetween(pos, Math.min(pos + 1, docSize))
  return /^\s$/.test(charAfter) || charAfter === ""
}

// --- 삭제 로직에서 사용할 따옴표 쌍 정의 ---
const quotePairsForDeletion: ReadonlyArray<[string, string]> = [
  ["‘", "’"], // Single typographic quotes
  ["“", "”"], // Double typographic quotes
]

export const autoQuotePlugin = new Plugin({
  props: {
    // --- handleTextInput은 이전과 동일 ---
    handleTextInput(
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

    // --- handleKeyDown 추가 ---
    handleKeyDown(view: EditorView, event: KeyboardEvent): boolean {
      // 1. Backspace 키이고 커서 상태일 때만 확인
      if (event.key === "Backspace" && view.state.selection.empty) {
        const { from } = view.state.selection
        const { state } = view
        const { doc } = state

        // 2. 문서 시작에서는 실행하지 않음 (앞 문자가 없음)
        if (from === 0) {
          return false
        }

        // 3. 커서 앞뒤 문자 가져오기 (경계 처리 포함)
        const charBefore = doc.textBetween(from - 1, from)
        const charAfter = doc.textBetween(
          from,
          Math.min(from + 1, doc.content.size),
        )

        // 4. 정의된 따옴표 쌍과 일치하는지 확인
        for (const [openQuote, closeQuote] of quotePairsForDeletion) {
          if (charBefore === openQuote && charAfter === closeQuote) {
            // 5. 일치하면 기본 동작 막고 트랜잭션 생성
            event.preventDefault()

            // 6. 여는 따옴표부터 닫는 따옴표까지 삭제하는 트랜잭션 생성
            const tr = state.tr.delete(
              from - 1, // 여는 따옴표 위치
              from + 1, // 닫는 따옴표 바로 다음 위치
            )

            // 7. 트랜잭션 적용
            view.dispatch(tr)

            // 8. 이벤트 처리 완료 알림
            return true
          }
        }
      }

      // 해당 조건이 아니면 false 반환하여 기본 동작 수행
      return false
    },
  },
})
