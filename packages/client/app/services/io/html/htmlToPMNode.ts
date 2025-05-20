import {
  DOMParser as ProseMirrorDOMParser,
  Fragment,
  type Schema,
} from "prosemirror-model"
import { LineBreakImportStrategy } from "~/types/options"
import {
  type PasteContentOptions,
  textToPMNodeContent,
} from "~/services/io/text/textToPMNode"

/**
 * 주어진 HTML 문자열을 지정된 lineBreakImportStrategy에 따라 ProseMirror Fragment로 변환합니다.
 * 현재 이 함수는 HTML에서 텍스트 콘텐츠를 추출한 후 textToPMNodeContent를 호출하는 방식으로 단순화되어 있습니다.
 * HTML 구조를 보존하면서 복잡한 전략을 적용하려면 추가적인 파싱 로직이 필요합니다.
 *
 * @param html 변환할 HTML 문자열입니다.
 * @param options 붙여넣기 전략 및 기타 옵션을 포함하는 객체입니다.
 * @param schema 사용할 ProseMirror 스키마입니다.
 * @returns 생성된 ProseMirror 노드들의 Fragment입니다.
 */
export function htmlToPMNodeContent(
  html: string,
  options: PasteContentOptions,
  schema: Schema,
): Fragment {
  const { strategy } = options

  // HTML을 파싱하여 DOM Document 생성
  const parser = new window.DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  const body = doc.body

  // Semantic, Structured: ProseMirror의 DOMParser를 최대한 활용
  if (
    strategy === LineBreakImportStrategy.Semantic ||
    strategy === LineBreakImportStrategy.Structured
  ) {
    // ProseMirror DOMParser는 <p>를 paragraphType으로, <br>을 hard_break으로 변환합니다.
    // 추가적인 미세 조정이 필요할 수 있으나, 기본 파싱 결과를 사용합니다.
    // Structured 전략의 "최대 3줄 단락" 규칙은 HTML의 명시적 구조 때문에 직접 적용하기 어렵습니다.
    // 이 경우 Semantic과 유사하게 동작하거나, 텍스트 추출 후 textToPMNodeContent를 사용하는 것을 고려할 수 있습니다.
    // 여기서는 표준 DOMParser 결과를 사용합니다.
    const pmParser = ProseMirrorDOMParser.fromSchema(schema)
    const slice = pmParser.parseSlice(body)
    return slice.content
  }

  // Flat, Verbatim: 텍스트만 추출하여 textToPMNodeContent 사용
  // 이 방식은 HTML 태그(스타일, 링크 등)를 모두 무시합니다.
  if (
    strategy === LineBreakImportStrategy.Flat ||
    strategy === LineBreakImportStrategy.Verbatim
  ) {
    // HTML에서 줄바꿈을 유지하며 텍스트 추출 (좀 더 정교한 방법 필요 가능성)
    // <p> -> \n\n, <br> -> \n 등으로 변환 후 textToPMNodeContent 호출
    let textContent = ""
    function extractTextWithLineBreaks(node: ChildNode) {
      if (node.nodeType === Node.TEXT_NODE) {
        textContent += node.textContent
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement
        const tagName = element.tagName.toLowerCase()
        if (tagName === "br") {
          textContent += "\n"
        } else {
          // 블록 요소의 경우, 앞뒤로 줄바꿈 추가 (이미 있다면 중복 방지 필요)
          const isBlock = window.getComputedStyle(element).display === "block"
          if (
            isBlock &&
            textContent.length > 0 &&
            !textContent.endsWith("\n\n") &&
            !textContent.endsWith("\n")
          ) {
            textContent += "\n" // 이전 내용과 구분을 위해, 단락 시작 전 한 줄 띄움처럼
          }

          element.childNodes.forEach(extractTextWithLineBreaks)

          if (
            isBlock &&
            !textContent.endsWith("\n\n") &&
            !textContent.endsWith("\n")
          ) {
            // 단락 종료 후 한 줄 띄움처럼
            // 단, 마지막 요소가 아니거나, 내용이 있을 때만
            if (element.nextSibling || element.textContent?.trim()) {
              textContent += "\n"
            }
          }
        }
      }
    }
    body.childNodes.forEach(extractTextWithLineBreaks)
    // 연속된 개행 정리 (예: \n\n\n -> \n\n) - 전략에 따라 필요 없을 수 있음
    // textContent = textContent.replace(/\n{3,}/g, '\n\n').trim();

    return textToPMNodeContent(textContent.trim(), options, schema)
  }

  // 알 수 없는 전략 또는 기본 처리
  console.warn(
    `htmlToPMNodeContent: Unknown or unhandled strategy ${strategy}. Using default DOM parsing.`,
  )
  return ProseMirrorDOMParser.fromSchema(schema).parseSlice(body).content
}
