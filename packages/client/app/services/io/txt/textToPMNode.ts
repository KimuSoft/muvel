import { Fragment, type Node as PMNode, type Schema } from "prosemirror-model"
import { EpisodeBlockType } from "muvel-api-types" // 귀하의 프로젝트에 맞게 경로를 조정하세요.
import { LineBreakImportStrategy } from "~/types/options" // 귀하의 프로젝트에 맞게 경로를 조정하세요.

export interface TextToPMNodeOption {
  strategy: LineBreakImportStrategy
  // 향후 다른 옵션이 추가될 수 있습니다.
  // exampleOption?: boolean;
}

/**
 * 주어진 텍스트를 지정된 lineBreakImportStrategy에 따라 ProseMirror Fragment로 변환합니다.
 *
 * @param text 변환할 원시 텍스트 문자열입니다.
 * @param options 붙여넣기 전략 및 기타 옵션을 포함하는 객체입니다.
 * @param schema 사용할 ProseMirror 스키마입니다.
 * @returns 생성된 ProseMirror 노드들의 Fragment입니다.
 */
export function textToPMNodeContent(
  text: string,
  options: TextToPMNodeOption,
  schema: Schema,
): Fragment {
  const { strategy } = options
  const nodes: PMNode[] = []
  const paragraphType = schema.nodes[EpisodeBlockType.Describe] // 또는 'paragraph' 등 기본 블록 타입
  const hardBreakNode = schema.nodes.hard_break
    ? schema.nodes.hard_break.create()
    : null

  const normalizedText = text.replace(/\r\n/g, "\n")

  if (!paragraphType) {
    console.error(
      `Schema is missing node type for '${EpisodeBlockType.Describe}' or a similar paragraph node.`,
    )
    return normalizedText
      ? Fragment.from(schema.text(normalizedText))
      : Fragment.empty
  }

  const mkParagraph = (content?: PMNode | PMNode[] | Fragment | null) => {
    // ID는 appendTransaction 플러그인에서 할당하므로 여기서는 null 또는 attrs 없이 생성
    return paragraphType.create(null, content)
  }

  switch (strategy) {
    case LineBreakImportStrategy.Flat: {
      const lines = normalizedText.split("\n")
      const contentNodes: PMNode[] = []
      lines.forEach((line, index) => {
        if (line) {
          contentNodes.push(schema.text(line))
        }
        if (index < lines.length - 1 && hardBreakNode) {
          contentNodes.push(hardBreakNode)
        }
      })
      if (contentNodes.length > 0 || lines.length > 1) {
        nodes.push(mkParagraph(Fragment.fromArray(contentNodes)))
      } else if (normalizedText) {
        nodes.push(mkParagraph(schema.text(normalizedText)))
      }
      break
    }

    case LineBreakImportStrategy.Verbatim: {
      const lines = normalizedText.split("\n")
      lines.forEach((line) => {
        nodes.push(mkParagraph(line ? schema.text(line) : null))
      })
      break
    }

    case LineBreakImportStrategy.Semantic: {
      const blocks = normalizedText.split(/(\n{4,})|(\n{2,3})/)
      let currentParagraphContent: PMNode[] = []

      blocks.filter(Boolean).forEach((segment) => {
        if (segment.match(/^\n{4,}$/)) {
          if (currentParagraphContent.length > 0) {
            nodes.push(mkParagraph(Fragment.fromArray(currentParagraphContent)))
            currentParagraphContent = []
          }
          const breaks: PMNode[] = []
          if (hardBreakNode) {
            for (let i = 0; i < segment.length - 1; i++) {
              breaks.push(hardBreakNode)
            }
          }
          if (breaks.length > 0) {
            nodes.push(mkParagraph(Fragment.fromArray(breaks)))
          } else {
            nodes.push(mkParagraph())
          }
        } else if (segment.match(/^\n{2,3}$/)) {
          if (currentParagraphContent.length > 0) {
            nodes.push(mkParagraph(Fragment.fromArray(currentParagraphContent)))
          }
          // 이전: if (segment.length === 3) { nodes.push(mkParagraph()); }
          // 수정: 위 조건문 제거 또는 주석 처리하여 \n\n\n 시 빈 단락 추가 방지
          currentParagraphContent = []
        } else {
          const lines = segment.split(/\n/)
          lines.forEach((line, index) => {
            if (line) {
              currentParagraphContent.push(schema.text(line))
            }
            if (index < lines.length - 1 && hardBreakNode) {
              currentParagraphContent.push(hardBreakNode)
            }
          })
        }
      })

      if (currentParagraphContent.length > 0) {
        nodes.push(mkParagraph(Fragment.fromArray(currentParagraphContent)))
      }

      if (nodes.length === 0 && normalizedText === "") {
        nodes.push(mkParagraph())
      }
      break
    }

    case LineBreakImportStrategy.Structured: {
      const lines = normalizedText.split("\n")
      let currentParagraphContent: PMNode[] = []
      let consecutiveNewlineCounter = 0 // 연속된 \n의 개수를 셉니다. (빈 줄의 개수 + 1)

      for (let i = 0; i <= lines.length; i++) {
        // 마지막 줄까지 처리하기 위해 lines.length까지 반복
        const line = lines[i]

        if (line === "" || i === lines.length) {
          // 현재 줄이 비었거나, 텍스트의 마지막 줄을 넘어선 경우 (버퍼 처리)
          consecutiveNewlineCounter++
        } else {
          // 텍스트가 있는 줄
          if (consecutiveNewlineCounter > 0) {
            // 이전에 하나 이상의 \n이 있었다면
            if (consecutiveNewlineCounter >= 4) {
              // 4줄 이상의 연속 줄바꿈 (\n\n\n\n)
              // 이전 단락 마무리 (있었다면)
              if (currentParagraphContent.length > 0) {
                nodes.push(
                  mkParagraph(Fragment.fromArray(currentParagraphContent)),
                )
                currentParagraphContent = []
              }
              // 연출 처리: (consecutiveNewlineCounter - 1)개의 hard_break을 가진 빈 단락 생성
              const breaksForEffect: PMNode[] = []
              if (hardBreakNode) {
                for (let j = 0; j < consecutiveNewlineCounter - 1; j++) {
                  breaksForEffect.push(hardBreakNode)
                }
              }
              if (breaksForEffect.length > 0) {
                nodes.push(mkParagraph(Fragment.fromArray(breaksForEffect)))
              } else {
                // hardBreakNode가 없거나, \n이 정확히 4개인데 hard_break을 만들 수 없는 경우 등 예외처리로 빈 단락 추가
                nodes.push(mkParagraph())
              }
            } else {
              // 1, 2, 3줄 연속 줄바꿈 (\n, \n\n, \n\n\n) -> 이전 단락 마무리 (빈 줄은 사라짐)
              if (currentParagraphContent.length > 0) {
                nodes.push(
                  mkParagraph(Fragment.fromArray(currentParagraphContent)),
                )
              }
              // 빈 줄은 무시하고 새 단락 준비 (다음 텍스트 라인에서 시작됨)
            }
            currentParagraphContent = [] // 새 단락 준비
          }
          // 현재 텍스트 줄의 내용을 currentParagraphContent에 추가
          currentParagraphContent.push(schema.text(line))
          consecutiveNewlineCounter = 0 // 텍스트를 만났으므로 카운터 리셋
        }
      }

      // 루프 종료 후 마지막으로 currentParagraphContent에 내용이 남아있다면 단락으로 추가
      if (currentParagraphContent.length > 0) {
        nodes.push(mkParagraph(Fragment.fromArray(currentParagraphContent)))
      } else if (consecutiveNewlineCounter >= 4) {
        // 텍스트가 \n\n\n\n... 로 끝나는 경우 연출 처리
        const breaksForEffect: PMNode[] = []
        if (hardBreakNode) {
          for (let j = 0; j < consecutiveNewlineCounter - 1; j++) {
            breaksForEffect.push(hardBreakNode)
          }
        }
        if (breaksForEffect.length > 0) {
          nodes.push(mkParagraph(Fragment.fromArray(breaksForEffect)))
        } else {
          nodes.push(mkParagraph())
        }
      }

      // 전체 입력이 비어 있었고, 결과 노드가 없다면 최소한 하나의 빈 단락 보장
      if (nodes.length === 0 && normalizedText === "") {
        nodes.push(mkParagraph())
      }
      break
    }

    default: {
      console.warn(
        `Unknown LineBreakImportStrategy: ${strategy}. Falling back to Semantic.`,
      )
      return textToPMNodeContent(
        normalizedText,
        { ...options, strategy: LineBreakImportStrategy.Semantic },
        schema,
      )
    }
  }
  return Fragment.fromArray(nodes)
}
