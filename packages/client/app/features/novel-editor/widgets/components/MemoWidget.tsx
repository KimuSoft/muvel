import React from "react"
import { Textarea, Text, VStack } from "@chakra-ui/react"
import { FaStickyNote } from "react-icons/fa"

import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/components/WidgetBase"
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"
import { useSpecificWidgetSettings } from "~/hooks/useAppOptions"

// 위젯 ID 정의 (widgetMap 등 다른 곳에서 관리될 수도 있음)
const WIDGET_ID = "memo"

// 기본 옵션 정의
const defaultMemoOptions: MemoWidgetOptions = {
  content: "", // 초기 메모 내용은 비어있음
}

export const MemoWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const [options, setOptions] = useSpecificWidgetSettings<MemoWidgetOptions>(
    WIDGET_ID,
    defaultMemoOptions,
  )

  // Textarea 내용 변경 시 호출될 핸들러
  const handleContentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newContent = event.target.value
    // setOptions 함수에 updater 함수를 전달하여 content 업데이트
    setOptions((draft) => {
      draft.content = newContent
    })
  }

  return (
    <WidgetBase>
      <WidgetHeader {...dragAttributes} {...dragListeners}>
        {/* 아이콘과 제목 설정 */}
        <FaStickyNote />
        <WidgetTitle>메모</WidgetTitle>
      </WidgetHeader>
      <WidgetBody>
        <VStack gap={2} align="stretch">
          {/* 메모 입력 Textarea */}
          <Textarea
            value={options.content}
            onChange={handleContentChange}
            placeholder="여기에 메모를 입력하세요..."
            size="sm" // 적절한 크기 설정
            minHeight="100px" // 최소 높이 설정
            maxHeight="80vh" // 최대 높이 설정
            // resize="none" // 크기 조절 비활성화 (선택 사항)
            flexGrow={1} // 남은 공간 채우도록 설정
          />
          {/* 설명 텍스트 */}
          <Text color="gray.500" fontSize="xs" textAlign="center">
            메모 내용은 브라우저 내에만 저장되며, 모든 에피소드에서 공유됩니다.
          </Text>
        </VStack>
      </WidgetBody>
    </WidgetBase>
  )
}

// src/features/editor/widgets/types.ts (예시 경로)
export interface MemoWidgetOptions {
  content: string
}
