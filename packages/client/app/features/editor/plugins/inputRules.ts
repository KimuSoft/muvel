import {
  inputRules,
  textblockTypeInputRule,
  InputRule as Rule,
} from "prosemirror-inputrules"
import { BlockType } from "muvel-api-types"
import type { Schema } from "prosemirror-model"
import { TextSelection } from "prosemirror-state"

export const createInputRules = (schema: Schema) => {
  const rules: Rule[] = []

  // 큰따옴표 → quote (double)
  rules.push(
    textblockTypeInputRule(/^"$/, schema.nodes[BlockType.Quote], {
      quoteStyle: "double",
    }),
  )

  // 작은따옴표 → quote (single)
  rules.push(
    textblockTypeInputRule(/^'$/, schema.nodes[BlockType.Quote], {
      quoteStyle: "single",
    }),
  )

  // --- → divider
  rules.push(
    new Rule(/^---$/, (state, match, start, end) => {
      const { tr, schema } = state
      const nodeType = schema.nodes[BlockType.Divider]
      if (!nodeType) return null

      const node = nodeType.create({})
      const newTr = tr.replaceRangeWith(start, end, node)
      return newTr.setSelection(
        TextSelection.create(newTr.doc, newTr.selection.to),
      )
    }),
  )

  return inputRules({ rules }) // ✅ Plugin 생성 후 반환
}
