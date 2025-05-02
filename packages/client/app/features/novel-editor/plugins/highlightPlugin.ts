import type { EditorState } from "prosemirror-state"
import { Plugin, PluginKey } from "prosemirror-state"
import { Decoration, DecorationSet } from "prosemirror-view"

// 찾기 결과 위치 타입
interface Match {
  from: number
  to: number
}

// 플러그인 메타 데이터 타입
interface HighlightMeta {
  type: "UPDATE_HIGHLIGHTS"
  matches: Match[]
  currentIndex: number
}

// 플러그인 키
export const highlightPluginKey = new PluginKey<DecorationSet>(
  "highlightPlugin",
)

export function highlightPlugin(): Plugin<DecorationSet> {
  return new Plugin<DecorationSet>({
    key: highlightPluginKey,
    state: {
      init(): DecorationSet {
        return DecorationSet.empty
      },
      apply(tr, oldDecorationSet, _oldState, newState): DecorationSet {
        const meta = tr.getMeta(highlightPluginKey) as HighlightMeta | undefined

        if (meta?.type === "UPDATE_HIGHLIGHTS") {
          console.log("Highlight plugin received meta transaction:", meta) // 메타 수신 로그
          const { matches, currentIndex } = meta
          const doc = tr.doc || newState.doc // 트랜잭션 또는 새 상태의 문서 사용

          const decorations = matches
            .map((match, index) => {
              const isCurrent = index === currentIndex
              // 위치 유효성 검사 추가
              const from = Math.max(0, Math.min(match.from, doc.content.size))
              const to = Math.max(from, Math.min(match.to, doc.content.size))
              if (from >= to) return null // 유효하지 않은 범위는 건너뜀

              return Decoration.inline(from, to, {
                class: `find-match-highlight ${isCurrent ? "current-find-match" : ""}`,
              })
            })
            .filter((d): d is Decoration => d !== null)

          return DecorationSet.create(doc, decorations)
        }

        if (tr.docChanged) {
          return oldDecorationSet.map(tr.mapping, tr.doc)
        }

        return oldDecorationSet
      },
    },
    props: {
      decorations(state: EditorState): DecorationSet | undefined {
        return this.getState(state)
      },
    },
  })
}
