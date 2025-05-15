import React, { useCallback, useEffect, useRef, useState } from "react"
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
} from "~/features/novel-editor/utils/countTextLength"
import ProgressBar from "~/components/atoms/ProgressBar"
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"
import {
  CharCountSettingsDialog,
  type CharCountWidgetOptions,
} from "~/features/novel-editor/components/dialogs/CharCountSettingDialog"
import { useWidgetOption } from "~/features/novel-editor/widgets/context/WidgetContext"

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

const THROTTLE_DELAY = 250

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
  const [selectedLength, setSelectedLength] = useState<number>(0)
  const [percentage, setPercentage] = useState<number>(0)
  const goalReachedRef = useRef<boolean>(false)
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  const updateDisplayCounts = useCallback(() => {
    if (!view) return

    const content = view.state.doc.textContent
    const len = countTextLength(content, options)
    setCurrentLength(len)

    const goal = options.targetGoal
    const currentPercentage = goal > 0 ? (len / goal) * 100 : 0
    setPercentage(currentPercentage)

    if (
      currentPercentage >= 100 &&
      !goalReachedRef.current &&
      options.showConfetti
    ) {
      triggerConfetti()
    }
    goalReachedRef.current = currentPercentage >= 100

    if (!view.state.selection.empty) {
      const { from, to } = view.state.selection
      const selectedText = view.state.doc.textBetween(from, to)
      const selLen = countTextLength(selectedText, options)
      setSelectedLength(selLen)
    } else {
      setSelectedLength(0)
    }
  }, [view, options, triggerConfetti])

  const throttledUpdateDisplayCounts = useCallback(() => {
    if (!throttleTimeoutRef.current) {
      updateDisplayCounts()
      throttleTimeoutRef.current = setTimeout(() => {
        throttleTimeoutRef.current = null
      }, THROTTLE_DELAY)
    }
  }, [updateDisplayCounts])

  useEffect(() => {
    if (view) {
      updateDisplayCounts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  useEffect(() => {
    if (view) {
      throttledUpdateDisplayCounts()
    }
    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
        throttleTimeoutRef.current = null
      }
    }
  }, [view?.state.doc, view?.state.selection, throttledUpdateDisplayCounts])

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
        <ProgressBar value={Math.min(1, percentage / 100)} />
      </WidgetBody>
    </WidgetBase>
  )
}
