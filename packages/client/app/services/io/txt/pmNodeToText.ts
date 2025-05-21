import { EpisodeBlockType } from "muvel-api-types" // 경로가 정확한지 확인해주세요.
import type { Node as ProseMirrorNode } from "prosemirror-model"
import type { AppExportOptions } from "~/types/options" // 경로가 정확한지 확인해주세요.

const getNodeTextWithHardBreaks = (node: ProseMirrorNode): string => {
  let text = ""

  node.content.forEach((child) => {
    if (child.type.name === "hard_break") {
      text += "\n"
    } else if (child.isText) {
      text += child.text
    } else if (child.isInline && child.content.size > 0) {
      text += getNodeTextWithHardBreaks(child)
    }
  })

  return text
}

export const pmNodeToText = (
  doc: ProseMirrorNode | null | undefined,
  options: AppExportOptions,
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

  // 문장 강제 줄바꿈 처리 함수
  const applyForcedLineBreaks = (text: string, spacing: number): string => {
    if (spacing <= 0) return text
    const sentenceEndRegex = /([.!?])(?!\n|$)\s*/g
    const lineBreak = "\n".repeat(spacing)
    return text.replace(sentenceEndRegex, (_match, p1) => {
      return p1 + lineBreak
    })
  }

  doc.content.forEach((node, _offset, index) => {
    switch (node.type.name) {
      case EpisodeBlockType.Describe: {
        let nodeText = getNodeTextWithHardBreaks(node)
        const currentNodeIsDialogue = isDialogue(nodeText)

        if (!currentNodeIsDialogue && options.forceLineBreakPerSentence > 0) {
          nodeText = applyForcedLineBreaks(
            nodeText,
            options.forceLineBreakPerSentence,
          )
        }

        if (index > 0) {
          let spacing = options.paragraphSpacing
          let addSpacing = true // 기본적으로 간격을 추가

          // '대사 사이 줄바꿈 제거' 옵션 처리
          if (
            options.removeLineBreaksBetweenDialogues &&
            previousNodeIsDialogue === true &&
            currentNodeIsDialogue === true
          ) {
            // 이전 노드도 대사고 현재 노드도 대사면, 기본 단락 간격(paragraphSpacing)을 적용하지 않음
            // 대신, 최소한의 줄바꿈(1개)만 필요할 수 있으나,
            // 사용자의 의도는 "자동 줄바꿈 삽입하지 않음"이므로,
            // 여기서는 추가적인 \n을 넣지 않거나, 옵션에 따라 1개의 \n만 넣을 수 있습니다.
            // 현재 로직은 paragraphSpacing을 0으로 만드는 효과와 유사하게 동작해야 합니다.
            // dialogueNarrationSpacing은 대사와 지문 사이 간격이므로 여기서는 직접 관련 없음.
            // 만약 대사끼리도 최소 1줄은 띄우고 싶다면 "\n"을 추가.
            // 여기서는 "자동 줄바꿈 삽입 안 함" = 추가 \n 없음으로 해석하고,
            // 기본적으로 모든 Describe 노드는 새 줄에서 시작한다고 가정합니다.
            // 그러나 현재 로직은 "\n".repeat(1 + spacing) 이므로,
            // spacing을 조정하거나, 이 \n 추가 로직 자체를 건너뛰어야 합니다.

            // 수정: 연속된 대사일 경우, 기본 간격 추가 로직을 건너뛰도록 플래그 설정
            addSpacing = false
            // output += "\n"; // 만약 연속 대사라도 최소 한 줄은 띄우고 싶다면 이 줄 활성화
          }

          if (addSpacing) {
            if (
              previousNodeIsDialogue !== null &&
              currentNodeIsDialogue !== previousNodeIsDialogue
            ) {
              spacing += options.dialogueNarrationSpacing
            }
            output += "\n".repeat(1 + spacing)
          } else if (previousNodeType !== null) {
            // 연속 대사이고, removeLineBreaksBetweenDialogues가 true일 때
            // 최소한의 줄바꿈(한 줄)은 필요하므로 추가합니다.
            // (각 Describe 노드는 별도의 단락이므로)
            output += "\n"
          }
        }

        output += nodeText
        previousNodeType = "paragraph"
        previousNodeIsDialogue = currentNodeIsDialogue
        break
      }
      case EpisodeBlockType.Divider: {
        if (index > 0) {
          output += "\n".repeat(1 + options.spacingBeforeSeparator)
        }
        output += options.separatorReplacement
        if (index < doc.content.childCount - 1) {
          output += "\n".repeat(options.spacingAfterSeparator)
        }
        previousNodeType = "divider"
        previousNodeIsDialogue = null
        break
      }
      case EpisodeBlockType.Comment: {
        if (options.includeComments) {
          if (index > 0) output += "\n".repeat(1 + options.paragraphSpacing)
          const commentText = node.textContent
          output += "// " + commentText // 주석 뒤에는 자동으로 줄바꿈을 넣지 않고, 다음 노드와의 간격에서 처리
          previousNodeType = "comment"
          previousNodeIsDialogue = null
        }
        break
      }
      default: {
        if (node.isBlock && node.textContent) {
          if (index > 0) output += "\n".repeat(1 + options.paragraphSpacing)
          const nodeText = node.textContent
          output += nodeText
          previousNodeType = node.type.name
          previousNodeIsDialogue = null
        }
      }
    }
  })

  return output.trim()
}
