import { EditorState, Plugin, TextSelection } from "prosemirror-state"
import { EditorView } from "prosemirror-view"

function isPrecededByWhitespaceOrStart(
  state: EditorState,
  pos: number,
): boolean {
  if (pos === 0) {
    return true
  }
  const $pos = state.doc.resolve(pos)
  // Check if at the very start of the textblock
  if ($pos.parentOffset === 0) {
    return true
  }
  const charBefore = state.doc.textBetween(Math.max(0, $pos.pos - 1), $pos.pos)
  // Check for actual whitespace character
  return /^\s$/.test(charBefore)
}

function isFollowedByWhitespaceOrEnd(state: EditorState, pos: number): boolean {
  const $pos = state.doc.resolve(pos)
  const parent = $pos.parent
  const docSize = state.doc.content.size
  // Check if at the very end of the textblock
  if ($pos.parentOffset === parent.content.size) {
    return true
  }
  // Check if at the very end of the document
  if (pos === docSize) {
    return true
  }
  // Check character immediately after position
  const charAfter = state.doc.textBetween(pos, Math.min(pos + 1, docSize))
  // Check for whitespace or if there's no character (end of node/doc handled above)
  return /^\s$/.test(charAfter) || charAfter === ""
}

// --- Quote definitions ---
const quotePairs: ReadonlyArray<[string, string]> = [
  ["‘", "’"], // Single typographic quotes
  ["“", "”"], // Double typographic quotes
]
const closingQuotes = quotePairs.map((pair) => pair[1])

// Mapping from straight quotes to typographic pairs
const quoteMap: Record<string, [string, string]> = {
  "'": ["‘", "’"],
  '"': ["“", "”"],
}

export const autoQuotePlugin = new Plugin({
  props: {
    handleTextInput(
      view: EditorView,
      from: number,
      to: number,
      text: string,
    ): boolean {
      // Check if the input is a straight quote character
      if (text in quoteMap) {
        const { state, dispatch } = view
        const [openQuote, closeQuote] = quoteMap[text]

        // Check conditions for inserting a PAIR of quotes
        const precededBySpaceOrStart = isPrecededByWhitespaceOrStart(
          state,
          from,
        )
        const followedBySpaceOrEnd = isFollowedByWhitespaceOrEnd(state, to)

        if (precededBySpaceOrStart && followedBySpaceOrEnd) {
          // --- Condition for PAIR met: Insert pair and move cursor ---
          const { tr } = state
          tr.replaceRangeWith(
            from,
            to,
            state.schema.text(openQuote + closeQuote), // Insert pair
          )
          // Place cursor between the quotes
          tr.setSelection(TextSelection.create(tr.doc, from + openQuote.length))
          dispatch(tr)
          return true // Input handled
        } else {
          // --- Condition for PAIR NOT met: Insert SINGLE smart quote ---
          // Determine if it should be an opening or closing quote based ONLY on preceding context
          const smartQuote = precededBySpaceOrStart ? openQuote : closeQuote

          const { tr } = state
          // Replace the typed straight quote with the determined smart quote
          tr.replaceRangeWith(from, to, state.schema.text(smartQuote))
          // No need to move selection for single character insertion
          dispatch(tr)
          return true // Input handled
        }
      }

      // If the input was not a straight quote or no conditions met, let ProseMirror handle it
      return false
    },

    // --- handleKeyDown (Backspace and Enter logic remains the same) ---
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

      // 2. Enter 키 로직 (이전과 동일)
      if (event.key === "Enter" && selection.empty) {
        const $pos = doc.resolve(from)
        const charAfter = doc.textBetween(
          from,
          Math.min(from + 1, doc.content.size),
        )

        if (
          charAfter &&
          closingQuotes.includes(charAfter) &&
          $pos.parentOffset + 1 === $pos.parent.content.size
        ) {
          event.preventDefault()
          const endOfBlock = $pos.end()
          const newNodeType = state.schema.nodes.paragraph || $pos.parent.type
          const newNode = newNodeType.createAndFill()

          if (newNode) {
            const tr = state.tr.insert(endOfBlock, newNode)
            const newSelectionPos = endOfBlock + 1
            tr.setSelection(TextSelection.create(tr.doc, newSelectionPos))
            view.dispatch(tr)
            return true
          }
        }
      }

      return false
    },
  },
})
