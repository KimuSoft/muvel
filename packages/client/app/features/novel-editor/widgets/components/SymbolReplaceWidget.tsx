import React, { useCallback } from "react"
import { Button, HStack, Icon, Text, VStack } from "@chakra-ui/react"
import { toaster } from "~/components/ui/toaster" // Toaster 경로 수정 필요
import { useEditorContext } from "~/features/novel-editor/context/EditorContext" // 경로 수정 필요
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap" // 경로 수정 필요
import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/components/WidgetBase" // 경로 수정 필요
import type { Node as ProseMirrorNode } from "prosemirror-model"
import type { Transaction } from "prosemirror-state"
import { FaEllipsis } from "react-icons/fa6"

// --- 기호 대치 위젯 컴포넌트 ---
const WIDGET_ID = "symbolReplace"

export const SymbolReplaceWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const { view } = useEditorContext()

  // 기호 대치 실행 함수
  const handleReplaceSymbols = useCallback(() => {
    if (!view) {
      toaster.warning({ title: "에디터를 찾을 수 없습니다." })
      return
    }

    const { state } = view
    const { doc, schema } = state
    let tr: Transaction | null = null // 변경 사항이 있을 때만 트랜잭션 생성
    let changesMade = false

    // 노드를 역순으로 순회하기 위한 배열 생성
    const nodesToProcess: { node: ProseMirrorNode; pos: number }[] = []
    doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        nodesToProcess.push({ node, pos })
      }
    })

    // 역순으로 처리하여 위치(pos) 문제 방지
    for (let i = nodesToProcess.length - 1; i >= 0; i--) {
      const { node, pos } = nodesToProcess[i]
      let originalText = node.text! // node.text가 null이 아님을 보장 (위에서 체크)
      let modifiedText = originalText

      // 1. 따옴표 대치 ("" -> “”, '' -> ‘’)
      //    (주의: 완벽한 컨텍스트 파악은 어려우므로, 기본적인 규칙 적용)
      //    - 단어 시작 또는 공백 뒤의 " -> “
      modifiedText = modifiedText.replace(/(^|\s|\()"/g, "$1“")
      //    - 나머지 " -> ”
      modifiedText = modifiedText.replace(/"/g, "”")
      //    - 단어 시작 또는 공백 뒤의 ' -> ‘
      modifiedText = modifiedText.replace(/(^|\s|\()'/, "$1‘")
      //    - 나머지 ' -> ’
      modifiedText = modifiedText.replace(/'/g, "’")

      // 2. 말줄임표 대치 (.. , ..., .... 등 -> …, ……)
      modifiedText = modifiedText.replace(/\.{2,}/g, (match) => {
        const len = match.length
        // 점 2개 이상이면 최소 1개, 3개 단위로 개수 증가
        const numEllipses = Math.max(1, Math.ceil(len / 3))
        return "…".repeat(numEllipses)
      })

      // 변경 사항이 있다면 트랜잭션에 추가
      if (modifiedText !== originalText) {
        if (!tr) {
          // 첫 변경 시 트랜잭션 생성
          tr = state.tr
        }
        // 해당 텍스트 노드 전체를 변경된 텍스트로 교체
        tr.replaceWith(pos, pos + node.nodeSize, schema.text(modifiedText))
        changesMade = true
      }
    }

    // 변경 사항이 있을 경우에만 트랜잭션 디스패치
    if (tr && changesMade) {
      view.dispatch(tr)
      toaster.success({ title: "기호 대치가 완료되었습니다." })
    } else {
      toaster.info({ title: "변경할 기호가 없습니다." })
    }
  }, [view]) // view가 변경될 때 함수 재생성

  return (
    <WidgetBase>
      <WidgetHeader>
        <HStack flex="1" cursor="grab" {...dragAttributes} {...dragListeners}>
          <Icon as={FaEllipsis} /> {/* 아이콘 사용 */}
          <WidgetTitle>기호 대치</WidgetTitle>
        </HStack>
      </WidgetHeader>

      <WidgetBody>
        <VStack gap={3} align="stretch">
          <Text fontSize="sm" color="fg.muted">
            {" "}
            {/* Chakra v3 스타일 시스템 고려 */}
            문서 전체의 따옴표(""/'')와 말줄임표(..)를 표준 기호(“”, ‘’, …)로
            일괄 변경합니다.
          </Text>
          <Button
            colorScheme="blue"
            onClick={handleReplaceSymbols}
            disabled={!view} // view가 없을 때 비활성화
            size="sm"
          >
            기호 일괄 변경 실행
          </Button>
        </VStack>
      </WidgetBody>
    </WidgetBase>
  )
}
