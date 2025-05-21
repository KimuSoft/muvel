import React, { useCallback, useEffect, useRef, useState } from "react"
import { HStack, IconButton, Spacer, Text, VStack } from "@chakra-ui/react"
import confetti from "canvas-confetti"
import { useDebouncedCallback } from "use-debounce"
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

const DEBOUNCE_DELAY = 300

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

  const [currentLength, setCurrentLength] = useState<number>(0)
  const [selectedLength, setSelectedLength] = useState<number>(0)
  const [percentage, setPercentage] = useState<number>(0)
  const goalReachedRef = useRef<boolean>(false)
  const initialLoadRef = useRef<boolean>(true)

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
    const currentPercentage = goal > 0 ? (len / goal) * 100 : len > 0 ? 100 : 0
    setPercentage(currentPercentage)

    const prevGoalReached = goalReachedRef.current
    goalReachedRef.current = currentPercentage >= 100 && goal > 0

    if (
      !initialLoadRef.current &&
      !prevGoalReached &&
      goalReachedRef.current &&
      options.showConfetti
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

  const debouncedCalculateCounts = useDebouncedCallback(
    calculateCounts,
    DEBOUNCE_DELAY,
    {
      // DEBOUNCE_DELAY 값으로 수정 (이전 코드에서는 500, 1000이 하드코딩 되어 있었음)
      maxWait: 1000, // maxWait는 필요에 따라 조절
    },
  )

  // Effect 1: 초기 계산 및 문서/선택 변경 시 디바운스된 계산 처리
  useEffect(() => {
    if (view) {
      if (initialLoadRef.current) {
        calculateCounts()
        initialLoadRef.current = false
      } else {
        debouncedCalculateCounts()
      }
    }
    return () => {
      debouncedCalculateCounts.cancel()
    }
  }, [view?.state, calculateCounts, debouncedCalculateCounts])

  // Effect 2: 관련 옵션 변경 시 즉시 재계산 (초기 로드 이후)
  useEffect(() => {
    if (view && !initialLoadRef.current) {
      debouncedCalculateCounts.cancel()
      calculateCounts()
    }
  }, [view, calculateCounts, debouncedCalculateCounts])

  // Effect 3: 선택된 텍스트 길이 계산 및 업데이트
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
