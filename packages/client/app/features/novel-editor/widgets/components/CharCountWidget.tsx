import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { HStack, IconButton, Spacer, Text, VStack } from "@chakra-ui/react"
import confetti from "canvas-confetti"
import { debounce } from "lodash-es"
import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/containers/WidgetBase"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import { IoSettings } from "react-icons/io5"
import { GoNumber } from "react-icons/go"
import {
  countTextLength,
  CountUnit,
} from "~/features/novel-editor/utils/countTextLength"
import ProgressBar from "~/components/atoms/ProgressBar"
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"
import {
  CharCountSettingsDialog,
  type CharCountWidgetOptions,
} from "~/features/novel-editor/components/dialogs/CharCountSettingDialog"
import { useSpecificWidgetSettings } from "~/hooks/useAppOptions"

export const CHAR_COUNT_WIDGET_ID = "charCount"

export const defaultCharCountOptions: CharCountWidgetOptions = {
  unit: CountUnit.Char,
  excludeSpaces: true,
  excludePunctuations: true,
  excludeSpecialChars: false,
  targetGoal: 3000,
  showConfetti: true,
}

const unitSuffix: Record<CountUnit, string> = {
  [CountUnit.Char]: "자",
  [CountUnit.Word]: "단어",
  [CountUnit.Sentence]: "문장",
  [CountUnit.KB]: "KB",
}

const DEBOUNCE_DELAY = 300 // 디바운스 지연 시간 증가 (필요시 조절)

export const CharCountWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const { view } = useEditorContext()
  const [options, _setOptions, _resetOptions] =
    useSpecificWidgetSettings<CharCountWidgetOptions>(
      CHAR_COUNT_WIDGET_ID,
      defaultCharCountOptions,
    )

  useEffect(() => {
    console.log("CharCountWidget mounted")
  }, [])

  const [currentLength, setCurrentLength] = useState<number>(0)
  const [selectedLength, setSelectedLength] = useState<number>(0)
  const [percentage, setPercentage] = useState<number>(0)
  const goalReachedRef = useRef<boolean>(false)
  const initialLoadRef = useRef<boolean>(true) // 초기 로드 여부 추적

  const triggerConfetti = useCallback(() => {
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
  }, [])

  const calculateCounts = useCallback(() => {
    if (!view) return

    const content = view.state.doc.textContent

    const len = countTextLength(content, options)
    setCurrentLength(len)

    const goal = options.targetGoal
    // targetGoal이 0이거나 음수일 경우, percentage는 0 또는 100 (len > 0 일때)으로 처리하여 폭죽 오작동 방지
    const currentPercentage = goal > 0 ? (len / goal) * 100 : len > 0 ? 100 : 0
    setPercentage(currentPercentage)

    const prevGoalReached = goalReachedRef.current
    goalReachedRef.current = currentPercentage >= 100 && goal > 0 // 목표가 0 초과일 때만 목표 달성으로 간주

    // 초기 로드가 아니고, 이전에는 목표 미달성이었고, 현재 목표 달성했으며, 폭죽 옵션이 켜져 있을 때만 실행
    if (
      !initialLoadRef.current &&
      !prevGoalReached &&
      goalReachedRef.current &&
      options.showConfetti &&
      goal > 0
    ) {
      triggerConfetti()
    }
  }, [
    view,
    options.unit,
    options.excludeSpaces,
    options.excludePunctuations,
    options.excludeSpecialChars,
    options.targetGoal,
    options.showConfetti,
    triggerConfetti,
  ])

  const debouncedCalculateCounts = useMemo(
    () =>
      debounce(calculateCounts, DEBOUNCE_DELAY, {
        leading: false,
      }),
    [calculateCounts],
  )

  // view 객체가 준비되거나, 문서 내용/선택이 변경될 때
  useEffect(() => {
    if (view) {
      if (initialLoadRef.current) {
        calculateCounts() // 초기 로드 시에는 즉시 계산
        initialLoadRef.current = false
      } else {
        debouncedCalculateCounts()
      }
    }
    return () => {
      debouncedCalculateCounts.cancel()
    }
    // 의존성 배열을 더 안정적인 값으로 변경
    // doc.toJSON()과 selection.toJSON()은 객체의 깊은 비교를 위해 JSON 문자열로 변환
  }, [view?.state?.doc, debouncedCalculateCounts, calculateCounts])

  useEffect(() => {
    if (!view) return

    if (!view.state.selection.empty) {
      const { from, to } = view.state.selection
      const selectedText = view.state.doc.textBetween(from, to)
      const selLen = countTextLength(selectedText, options)
      setSelectedLength(selLen)
    } else {
      setSelectedLength(0)
    }
  }, [view?.state?.selection, options])

  // 위젯의 옵션이 변경되었을 때 즉시 글자 수 다시 계산
  useEffect(() => {
    console.log("CharCountWidget options changed")
    if (view) {
      calculateCounts()
      // 옵션 변경 시 initialLoadRef는 이미 false일 것이므로, calculateCounts 내부의 폭죽 로직이 올바르게 작동
    }
  }, [
    view, // view가 있어야 계산 가능
    options.unit,
    options.excludeSpaces,
    options.excludePunctuations,
    options.excludeSpecialChars,
    options.targetGoal,
    options.showConfetti,
    calculateCounts, // calculateCounts 함수 자체가 의존성에 포함되어야 함
  ])

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
            <IoSettings />
          </IconButton>
        </CharCountSettingsDialog>
      </WidgetHeader>
      <WidgetBody pt={2} pb={3}>
        <HStack w="100%" mb={1} alignItems="baseline">
          <VStack align="baseline" gap={0} flexShrink={0}>
            <Text fontSize="sm" whiteSpace="nowrap">
              {currentLength.toLocaleString()} /{" "}
              {options.targetGoal.toLocaleString()}
              {unitSuffix[options.unit]}
              {selectedLength > 0 && (
                <Text as="span" fontSize="sm" color="purple.500" ml={1.5}>
                  ({selectedLength.toLocaleString()}
                  {unitSuffix[options.unit]} 선택)
                </Text>
              )}
            </Text>
          </VStack>
          <Spacer />
          <Text fontSize={"lg"} fontWeight={"bold"} flexShrink={0}>
            {Math.floor(percentage)}%
          </Text>
        </HStack>
        <ProgressBar
          value={options.targetGoal > 0 ? Math.min(1, percentage / 100) : 0}
        />
      </WidgetBody>
    </WidgetBase>
  )
}
