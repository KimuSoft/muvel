import React, { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { HStack, IconButton, Spacer, Text, VStack } from "@chakra-ui/react"
import confetti from "canvas-confetti"
import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/components/WidgetBase"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import { IoSettings } from "react-icons/io5"
import { GoNumber } from "react-icons/go"
import {
  countTextLength,
  CountUnit,
  type CountOptions,
} from "~/features/novel-editor/utils/countTextLength"
import ProgressBar from "~/components/atoms/ProgressBar"
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"
import {
  CharCountSettingsDialog,
  type CharCountWidgetOptions,
} from "~/features/novel-editor/components/dialogs/CharCountSettingDialog"
import { useWidgetOption } from "~/features/novel-editor/widgets/context/WidgetContext"

// 위젯 ID
export const CHAR_COUNT_WIDGET_ID = "charCount"

// 기본 옵션 정의
export const defaultCharCountOptions: CharCountWidgetOptions = {
  unit: CountUnit.Char,
  excludeSpaces: true,
  excludeSpecialChars: false,
  targetGoal: 3000,
  showConfetti: true,
}

// 단위별 접미사
const unitSuffix: Record<CountUnit, string> = {
  [CountUnit.Char]: "자",
  [CountUnit.Word]: "단어",
  [CountUnit.Sentence]: "문장",
  [CountUnit.KB]: "KB",
}

// 스로틀링 지연 시간
const THROTTLE_DELAY = 500

export const CharCountWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const { view } = useEditorContext()
  const [options, _setOptions] = useWidgetOption<CharCountWidgetOptions>(
    CHAR_COUNT_WIDGET_ID,
    defaultCharCountOptions,
  )

  const [currentLength, setCurrentLength] = useState<number>(0)
  const [percentage, setPercentage] = useState<number>(0)
  const goalReachedRef = useRef<boolean>(false) // 목표 달성 상태 추적
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 계산 옵션 객체
  const countOptions = useMemo(
    (): CountOptions => ({
      unit: options.unit,
      excludeSpaces: options.excludeSpaces,
      excludeSpecialChars: options.excludeSpecialChars,
    }),
    [options.unit, options.excludeSpaces, options.excludeSpecialChars],
  )

  // 폭죽 터뜨리기 함수
  const triggerConfetti = () => {
    const duration = 5 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1050 }
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)
      const particleCount = 50 * (timeLeft / duration)
      void confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        }),
      )
      void confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        }),
      )
    }, 250)
  }

  // 현재 길이 및 상태 업데이트 함수
  const updateLengthAndState = useCallback(() => {
    if (!view) return

    const content = view.state.doc.textContent
    const len = countTextLength(content, countOptions)
    setCurrentLength(len)

    const goal = options.targetGoal
    const currentPercentage = goal > 0 ? (len / goal) * 100 : 0
    setPercentage(currentPercentage)

    // --- 폭죽 로직 ---
    // 1. 현재 상태가 100% 이상이고, 이전 상태가 100% 미만이었으며, 폭죽 옵션이 켜져 있을 때만 실행
    if (
      currentPercentage >= 100 &&
      !goalReachedRef.current &&
      options.showConfetti
    ) {
      triggerConfetti() // 폭죽 실행
    }
    // 2. 현재 퍼센티지를 기준으로 goalReachedRef 업데이트 (폭죽 실행 여부와 관계없이)
    goalReachedRef.current = currentPercentage >= 100
    // ---------------------
  }, [view, countOptions, options.targetGoal, options.showConfetti]) // 의존성 배열 확인

  // 스로틀링된 계산 함수 실행
  const throttledUpdate = useCallback(() => {
    if (!throttleTimeoutRef.current) {
      updateLengthAndState() // 즉시 실행
      throttleTimeoutRef.current = setTimeout(() => {
        throttleTimeoutRef.current = null
      }, THROTTLE_DELAY)
    }
  }, [updateLengthAndState])

  useEffect(() => {
    if (view) {
      const initialContent = view.state.doc.textContent
      const initialLen = countTextLength(initialContent, countOptions)
      setCurrentLength(initialLen)

      const goal = options.targetGoal
      const initialPercentage = goal > 0 ? (initialLen / goal) * 100 : 0
      setPercentage(initialPercentage)

      // 초기 상태가 이미 100% 이상이면 goalReachedRef를 true로 설정 (폭죽은 터뜨리지 않음)
      goalReachedRef.current = initialPercentage >= 100
    }
  }, [view])
  // ---------------------------------

  // 에디터 내용 변경 시 길이 계산 (스로틀링 적용)
  useEffect(() => {
    if (view) throttledUpdate()

    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
        throttleTimeoutRef.current = null
      }
    }
  }, [view?.state.doc, throttledUpdate])

  return (
    <WidgetBase>
      <WidgetHeader>
        <HStack flex="1" cursor="grab" {...dragAttributes} {...dragListeners}>
          <GoNumber />
          <WidgetTitle>글자 수 세기</WidgetTitle>
        </HStack>
        <CharCountSettingsDialog>
          <IconButton
            aria-label="글자 수 세기 설정"
            size="xs"
            variant={"ghost"}
          >
            <IoSettings size={9} />
          </IconButton>
        </CharCountSettingsDialog>
      </WidgetHeader>
      <WidgetBody pt={2} pb={3}>
        <HStack w="100%" mb={1}>
          <VStack align="baseline" gap={0}>
            <Text fontSize="sm">
              {currentLength.toLocaleString()}
              {unitSuffix[options.unit]} / {options.targetGoal.toLocaleString()}
              {unitSuffix[options.unit]}
            </Text>
          </VStack>
          <Spacer />
          <Text fontSize={"lg"} fontWeight={"bold"}>
            {Math.floor(percentage)}%
          </Text>
        </HStack>
        <ProgressBar value={Math.min(1, percentage / 100)} />
      </WidgetBody>
    </WidgetBase>
  )
}
