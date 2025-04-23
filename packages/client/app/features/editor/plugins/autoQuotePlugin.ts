import { Plugin, TextSelection, EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"

/**
 * Checks if the character before the given position is whitespace or
 * if the position is at the very beginning of its parent node.
 *
 * @param state - The current editor state.
 * @param pos - The position to check before.
 * @returns True if preceded by whitespace or at the start of the node, false otherwise.
 */
function isPrecededByWhitespaceOrStart(
  state: EditorState,
  pos: number,
): boolean {
  // Check if it's the very start of the document
  if (pos === 0) {
    return true
  }
  const $pos = state.doc.resolve(pos)

  // Check if it's the start of the parent node (e.g., paragraph)
  if ($pos.parentOffset === 0) {
    return true
  }

  // Check the character immediately before the position
  const charBefore = state.doc.textBetween(Math.max(0, $pos.pos - 1), $pos.pos)

  // Check if the character before is whitespace (\s matches spaces, tabs, newlines etc.)
  // Allow empty string check as well, potentially for edge cases? Primarily check whitespace.
  return /^\s$/.test(charBefore)
}

/**
 * Checks if the character after the given position is whitespace or
 * if the position is at the very end of its parent node.
 *
 * @param state - The current editor state.
 * @param pos - The position to check after.
 * @returns True if followed by whitespace or at the end of the node, false otherwise.
 */
function isFollowedByWhitespaceOrEnd(state: EditorState, pos: number): boolean {
  const $pos = state.doc.resolve(pos)
  const parent = $pos.parent
  const docSize = state.doc.content.size

  // Check if it's the end of the parent node
  if ($pos.parentOffset === parent.content.size) {
    return true
  }
  // Also check if it's the very end of the document, just in case
  if (pos === docSize) {
    return true
  }

  // Check the character immediately after the position
  const charAfter = state.doc.textBetween(pos, Math.min(pos + 1, docSize))

  // Check if the character after is whitespace OR if there's no character (end of node/doc)
  return /^\s$/.test(charAfter) || charAfter === ""
}

export const autoQuotePlugin = new Plugin({
  props: {
    // Conditionally replace standard quotes with a pair of typographic quotes
    handleTextInput(
      view: EditorView,
      from: number,
      to: number,
      text: string,
    ): boolean {
      // Define the mapping from standard quotes to typographic quotes [open, close]
      const quoteMap: Record<string, [string, string]> = {
        "'": ["‘", "’"], // Single quotes
        '"': ["“", "”"], // Double quotes
      }

      // Check if the typed text is one of the keys in our quoteMap
      if (text in quoteMap) {
        const { state, dispatch } = view

        // --- Condition Check ---
        // Determine if the "insert pair" behavior should activate.
        // It activates if the cursor is preceded by whitespace/start AND followed by whitespace/end.
        const shouldActivatePair =
          isPrecededByWhitespaceOrStart(state, from) &&
          isFollowedByWhitespaceOrEnd(state, to) // Use 'to' for checking after, often same as 'from'

        // --- Apply Transformation (only if condition met) ---
        if (shouldActivatePair) {
          const [openQuote, closeQuote] = quoteMap[text]
          const { tr } = state

          // Replace the typed quote with the open+close pair
          tr.replaceRangeWith(
            from,
            to,
            state.schema.text(openQuote + closeQuote),
          )
          // Set the selection *between* the inserted quotes
          tr.setSelection(TextSelection.create(tr.doc, from + openQuote.length))

          // Apply the transaction
          dispatch(tr)
          return true // Indicate that we've handled the input
        }
      }

      // If the typed text is not a quote OR the conditions are not met,
      // return false to let ProseMirror handle the input normally.
      return false
    },
  },
})
