import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Button, Text, HStack, VStack, Group } from "@chakra-ui/react"
import { FaStopwatch } from "react-icons/fa" // 스톱워치 아이콘

import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/editor/widgets/components/WidgetBase" // 기본 위젯 컴포넌트 경로
import type { WidgetBaseProps } from "~/features/editor/widgets/components/widgetMap"
import { toaster } from "~/components/ui/toaster"

// 위젯 ID 정의
const WIDGET_ID = "stopwatch"
// 최대 시간 (999분 59초)을 초 단위로 정의
const MAX_SECONDS = 999 * 60 + 59

export const StopwatchWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const [seconds, setSeconds] = useState(0) // 총 경과 시간 (초)
  const [isActive, setIsActive] = useState(false) // 스톱워치 활성화 여부

  // 타이머 로직 (useEffect 사용)
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isActive) {
      intervalId = setInterval(() => {
        setSeconds((prevSeconds) => {
          const nextSeconds = prevSeconds + 1

          // 최대 시간 초과 체크
          if (nextSeconds > MAX_SECONDS) {
            toaster.warning({
              title: "저기... 어디 가신 거 아니죠?",
            })
            setIsActive(false) // 타이머 중지
            if (intervalId) clearInterval(intervalId) // 인터벌 정리 확실히
            return 0 // 시간 초기화
          }
          return nextSeconds
        })
      }, 1000) // 1초마다 실행
    } else if (!isActive && seconds !== 0) {
      // 비활성화 상태일 때 인터벌 정리 (reset 시에도 필요)
      if (intervalId) clearInterval(intervalId)
    }

    // 컴포넌트 언마운트 또는 isActive 변경 시 인터벌 정리
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isActive]) // isActive 상태가 변경될 때마다 effect 재실행

  // 타이머 시작/일시정지 토글 함수
  const toggleTimer = useCallback(() => {
    setIsActive((prevIsActive) => !prevIsActive)
  }, [])

  // 타이머 초기화 함수
  const resetTimer = useCallback(() => {
    setSeconds(0)
    setIsActive(false)
  }, [])

  // 시간을 MM:SS 형식으로 포맷하는 로직 (useMemo 사용 최적화)
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    // String.padStart를 사용하여 2자리로 만들고 앞에 0을 채움
    const displayMinutes = String(minutes).padStart(2, "0")
    const displaySeconds = String(remainingSeconds).padStart(2, "0")
    return `${displayMinutes}:${displaySeconds}`
  }, [seconds]) // seconds가 변경될 때만 재계산

  return (
    <WidgetBase>
      <WidgetHeader {...dragAttributes} {...dragListeners}>
        <FaStopwatch />
        <WidgetTitle>스톱워치</WidgetTitle>
      </WidgetHeader>
      <WidgetBody>
        <VStack gap={3} align="stretch">
          {" "}
          {/* spacing 대신 gap 사용 */}
          {/* 시간 표시 */}
          <Text fontSize="4xl" fontWeight="bold" textAlign="center">
            {formattedTime}
          </Text>
          {/* 버튼 그룹 */}
          <HStack gap={2}>
            {" "}
            {/* spacing 대신 gap 사용 */}
            <Group w={"100%"} attached>
              <Button
                onClick={toggleTimer}
                colorScheme={isActive ? "yellow" : "green"}
                flex={1}
                variant={"outline"}
                size={"xs"}
              >
                {isActive ? "일시정지" : "시작"}
              </Button>
              <Button
                onClick={resetTimer}
                disabled={seconds === 0 && !isActive}
                flex={1}
                size={"xs"}
                variant={"outline"}
              >
                초기화
              </Button>
            </Group>
          </HStack>
        </VStack>
      </WidgetBody>
    </WidgetBase>
  )
}
