import type { Node as ProseMirrorNode } from "prosemirror-model"

// --- 타입 정의 시작 ---
export interface ExportOptions {
  paragraphSpacing: number // 문단 사이 추가 줄바꿈 (0-3)
  dialogueNarrationSpacing: number // 대사/묘사 사이 추가 줄바꿈 (0-3)
  separatorReplacement: string // 구분선 대치 문자열
  spacingBeforeSeparator: number // 구분선 앞 추가 줄바꿈 (0-5) -> 최소 1줄 보장됨
  spacingAfterSeparator: number // 구분선 뒤 추가 줄바꿈 (0-5) -> 최소 1줄 보장됨
  forceLineBreakPerSentence: number // 문장 부호 뒤 강제 줄바꿈 (0-3)
  includeComments: boolean // 주석 포함 여부
}
// --- 타입 정의 끝 ---

// --- 헬퍼 함수: ProseMirror Doc -> Plain Text 변환 시작 ---
export const processContentForExport = (
  doc: ProseMirrorNode | null | undefined,
  options: ExportOptions,
): string => {
  if (!doc) return ""

  let output = ""
  let previousNodeType: string | null = null
  let previousNodeIsDialogue: boolean | null = null

  // 대사 시작 문자열 검사 함수
  const isDialogue = (text: string): boolean => {
    const trimmedText = text.trimStart()
    return ['"', "“", "”", "‘", "’", "-", "—"].some((quote) =>
      trimmedText.startsWith(quote),
    )
  }

  // 문장 강제 줄바꿈 처리 함수 (수정됨)
  const applyForcedLineBreaks = (text: string, spacing: number): string => {
    if (spacing <= 0) return text

    // 문장 부호(.!?) 뒤에 (줄바꿈 없이) 공백이나 문자열 끝이 오는 경우 찾기
    // 정규식 수정: 문장 부호 뒤의 공백까지 포함하여 찾도록 변경 (\s*)
    const sentenceEndRegex = /([.!?])(?!\n|$)\s*/g
    const lineBreak = "\n".repeat(spacing)

    // 수정: 찾은 부분(문장부호 + 뒤따르는 공백)을 '문장부호 + 줄바꿈'으로 치환
    return text.replace(sentenceEndRegex, (_match, p1) => {
      // p1: 문장 부호
      return p1 + lineBreak
    })
  }

  doc.content.forEach((node, _offset, index) => {
    // 1. 문단(Paragraph) 노드 처리
    switch (node.type.name) {
      case "describe": {
        let nodeText = node.textContent
        const currentNodeIsDialogue = isDialogue(nodeText)

        // 대사가 아닐 경우(!currentNodeIsDialogue)에만 문장 강제 줄바꿈 적용
        if (!currentNodeIsDialogue && options.forceLineBreakPerSentence > 0) {
          nodeText = applyForcedLineBreaks(
            nodeText,
            options.forceLineBreakPerSentence,
          )
        }

        // 이전 노드와의 간격 처리
        if (index > 0) {
          let spacing = options.paragraphSpacing
          if (
            previousNodeIsDialogue !== null &&
            currentNodeIsDialogue !== previousNodeIsDialogue
          ) {
            spacing += options.dialogueNarrationSpacing
          }
          output += "\n".repeat(1 + spacing)
        }

        output += nodeText
        previousNodeType = "paragraph"
        previousNodeIsDialogue = currentNodeIsDialogue
        break
      }
      case "divider": {
        // 구분선 앞 줄바꿈 (최소 1줄 보장)
        if (index > 0) {
          output += "\n".repeat(1 + options.spacingBeforeSeparator)
        }
        output += options.separatorReplacement
        // 구분선 뒤 줄바꿈 (옵션 값만큼, 마지막 노드 아니면)
        if (index < doc.content.childCount - 1) {
          output += "\n".repeat(options.spacingAfterSeparator)
        }
        previousNodeType = "divider"
        previousNodeIsDialogue = null
        break
      }
      case "comment": {
        // 주석 처리
        if (options.includeComments) {
          if (index > 0) output += "\n".repeat(1 + options.paragraphSpacing)
          const commentText = node.textContent
          output += "// " + commentText + "\n"
          previousNodeType = "comment"
          previousNodeIsDialogue = null
        }
        break
      }
      default: {
        if (node.isBlock && node.textContent) {
          if (index > 0) output += "\n".repeat(1 + options.paragraphSpacing)
          const nodeText = node.textContent // 기타 블록은 강제 줄바꿈 미적용
          output += nodeText
          previousNodeType = node.type.name
          previousNodeIsDialogue = null
        }
      }
    }
  })

  return output.trim()
}
// --- 헬퍼 함수 끝 ---
