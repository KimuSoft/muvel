import React, { useMemo } from "react"
import { HStack, Icon, Text, Textarea, VStack } from "@chakra-ui/react"
import { LuMessageSquareQuote } from "react-icons/lu" // 위젯 아이콘 예시
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap" // 경로 수정 필요
import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/containers/WidgetBase"
import { useEpisodeContext } from "~/features/novel-editor/context/EpisodeContext" // 경로 수정 필요

// Debounce delay 제거됨

// --- 작가의 말 위젯 컴포넌트 ---
const WIDGET_ID = "authorComment"

export const AuthorCommentWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const { episode, updateEpisodeData } = useEpisodeContext()

  const handleCommentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newComment = event.target.value
    // 로컬 상태 업데이트 대신 직접 context 상태 업데이트 함수 호출
    updateEpisodeData((draft) => {
      if (draft) {
        draft.authorComment = newComment
      }
    })
  }

  // 현재 작가의 말 가져오기 (null 처리 포함)
  const currentComment = episode?.authorComment || ""
  // 작가의 말 글자 수 계산
  const commentLength = useMemo(() => currentComment.length, [currentComment])

  return (
    <WidgetBase>
      <WidgetHeader>
        <HStack flex="1" cursor="grab" {...dragAttributes} {...dragListeners}>
          <Icon as={LuMessageSquareQuote} />
          <WidgetTitle>작가의 말</WidgetTitle>
          <Text fontSize="xs" color="gray.500" ml={2}>
            ({commentLength.toLocaleString()}자)
          </Text>
        </HStack>
      </WidgetHeader>

      <WidgetBody>
        <VStack align="stretch">
          <Textarea
            placeholder="작가의 말을 입력하세요..."
            value={currentComment}
            onChange={handleCommentChange}
            minH="150px"
            size="sm"
            disabled={!episode} // episode가 null이면 비활성화
          />
        </VStack>
      </WidgetBody>
    </WidgetBase>
  )
}
