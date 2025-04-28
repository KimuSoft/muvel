import {
  InputRule as Rule,
  InputRule,
  inputRules,
} from "prosemirror-inputrules"
import { BlockType } from "muvel-api-types"
import type { Schema } from "prosemirror-model"
import { TextSelection } from "prosemirror-state"

function textReplaceRule(regex: RegExp, replaceWith: string) {
  return new InputRule(regex, (state, match, start, end) => {
    const tr = state.tr
    tr.replaceWith(start, end, state.schema.text(replaceWith))
    return tr
  })
}

export const createInputRules = (schema: Schema) => {
  const rules: Rule[] = [
    textReplaceRule(/->$/, "→"),
    textReplaceRule(/<-$/, "←"),
    textReplaceRule(/--$/, "—"),
    textReplaceRule(/<</, "«"),
    textReplaceRule(/>>/, "»"),
    textReplaceRule(/=>$/, "⇒"),
    textReplaceRule(/<=$/, "⇐"),
    textReplaceRule(/\.{3}/, "…"),
  ]

  // 큰따옴표 → quote (double)
  // rules.push(
  //   textblockTypeInputRule(/^"$/, schema.nodes[BlockType.Quote], {
  //     quoteStyle: "double",
  //   }),
  // )

  // 작은따옴표 → quote (single)
  // rules.push(
  //   textblockTypeInputRule(/^'$/, schema.nodes[BlockType.Quote], {
  //     quoteStyle: "single",
  //   }),
  // )

  // --- → divider
  rules.push(
    new Rule(/^(--|—)-$|^\*{3,}$/, (state, match, start, end) => {
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

  rules.push(
    new Rule(/\/\/$/, (state, match, start, end) => {
      const { tr, schema, selection } = state
      const { $from } = selection

      const nodeType = schema.nodes[BlockType.Comment]
      if (!nodeType) return null

      // 현재 위치의 노드 정보 가져오기
      const pos = $from.before()
      const node = tr.doc.nodeAt(pos)
      if (!node) return null

      // 입력한 // 텍스트 제거
      tr.delete(start, end)

      // 블록 타입 변경 (attrs 유지 + 내용 초기화)
      tr.setNodeMarkup(pos, nodeType, node.attrs)

      // 블록 내부에 커서 위치시키기 (내용 비었으므로 +1 위치)
      const resolvedPos = tr.doc.resolve(pos + 1)
      tr.setSelection(TextSelection.create(tr.doc, resolvedPos.pos))

      return tr
    }),
  )

  return inputRules({ rules }) // ✅ Plugin 생성 후 반환
}
