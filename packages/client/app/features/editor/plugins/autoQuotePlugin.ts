import { Plugin, TextSelection } from "prosemirror-state"

export const autoQuotePlugin = new Plugin({
  props: {
    handleTextInput(view, from, to, text) {
      const quoteMap: Record<string, [string, string]> = {
        "'": ["‘", "’"],
        '"': ["“", "”"],
      }

      if (text in quoteMap) {
        const [openQuote, closeQuote] = quoteMap[text]

        const { state, dispatch } = view
        const { tr } = state

        // 따옴표를 열고 닫는 텍스트 노드를 삽입하고 커서를 그 사이로 이동
        tr.replaceRangeWith(from, to, state.schema.text(openQuote + closeQuote))

        // 커서를 따옴표 사이로 위치시키기
        tr.setSelection(TextSelection.create(tr.doc, from + openQuote.length))

        dispatch(tr)
        return true // 기본 입력 막기
      }

      return false
    },
  },
})
