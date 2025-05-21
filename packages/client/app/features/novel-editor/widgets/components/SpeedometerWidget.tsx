// app/features/novel-editor/widgets/components/SpeedometerWidget.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { HStack, Icon, IconButton, Text, VStack } from "@chakra-ui/react"
import { BsSpeedometer } from "react-icons/bs"
import { BiReset } from "react-icons/bi"

import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/containers/WidgetBase"
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import {
  countTextLength,
  CountType,
} from "~/features/novel-editor/utils/measureText"
import ProgressBar from "~/components/atoms/ProgressBar"
import { Tooltip } from "~/components/ui/tooltip"
import { MdPause, MdPlayArrow } from "react-icons/md"

const WIDGET_ID = "speedometer"
const TARGET_LENGTH = 3000
const CALCULATION_INTERVAL_MS = 1000
const SPEED_CALC_SECONDS = 5
const HISTORY_DURATION_SECONDS = 60
const MAX_SPEED_DISPLAY = 600

interface LengthRecord {
  timestamp: number
  length: number
}

export const SpeedometerWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const { view } = useEditorContext()

  const [speed, setSpeed] = useState<number>(0)
  const [avgSpeed, setAvgSpeed] = useState<number>(0)
  const [predictedMinutes, setPredictedMinutes] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  const lengthHistoryRef = useRef<LengthRecord[]>([])
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)

  const runCalculation = useCallback(() => {
    if (!view || isPaused) {
      return
    }

    const now = Date.now()
    const currentDoc = view.state.doc
    const currentLength = countTextLength(currentDoc, CountType.NoSpacing)

    // 새 기록 추가 전, 마지막 기록과 현재 길이가 같다면 중복 추가 방지 (선택적 최적화)
    const lastEntry =
      lengthHistoryRef.current[lengthHistoryRef.current.length - 1]
    if (
      lastEntry &&
      lastEntry.length === currentLength &&
      lastEntry.timestamp === now
    ) {
      // 이미 동일한 타임스탬프와 길이의 기록이 있다면 추가하지 않음
      // (매우 짧은 인터벌로 인해 발생 가능성 낮음)
    } else {
      lengthHistoryRef.current.push({ timestamp: now, length: currentLength })
    }

    const historyStartTime = now - HISTORY_DURATION_SECONDS * 1000
    // filter 후 새로운 배열을 할당하여 ref가 항상 최신 기록을 참조하도록 함
    lengthHistoryRef.current = lengthHistoryRef.current.filter(
      (record) => record.timestamp >= historyStartTime,
    )
    const recentHistory = lengthHistoryRef.current

    if (recentHistory.length < 2) {
      setSpeed(0)
      setAvgSpeed(0)
      setPredictedMinutes(null)
      return
    }

    const speedCalcStartTime = now - SPEED_CALC_SECONDS * 1000
    const recordBeforeSpeedStart = recentHistory
      .filter((r) => r.timestamp < speedCalcStartTime)
      .pop()

    let currentSpeed = 0
    if (
      recordBeforeSpeedStart &&
      recentHistory[recentHistory.length - 1].timestamp >
        recordBeforeSpeedStart.timestamp
    ) {
      const lastRecord = recentHistory[recentHistory.length - 1]
      const lengthDiff = lastRecord.length - recordBeforeSpeedStart.length
      const timeDiffSeconds =
        (lastRecord.timestamp - recordBeforeSpeedStart.timestamp) / 1000

      if (timeDiffSeconds > 0 && lengthDiff >= 0) {
        currentSpeed = Math.round((lengthDiff / timeDiffSeconds) * 60)
      }
    }
    setSpeed(currentSpeed)

    const firstRecord = recentHistory[0]
    const lastRecord = recentHistory[recentHistory.length - 1]
    const totalTimeDiffSeconds =
      (lastRecord.timestamp - firstRecord.timestamp) / 1000
    const totalLengthDiff = lastRecord.length - firstRecord.length

    let averageSpeed = 0
    if (totalTimeDiffSeconds > 0 && totalLengthDiff >= 0) {
      averageSpeed = Math.round((totalLengthDiff / totalTimeDiffSeconds) * 60)
    }
    setAvgSpeed(averageSpeed)

    const remainingLength = Math.max(0, TARGET_LENGTH - currentLength)
    let prediction: number | null = null
    if (remainingLength === 0) {
      prediction = 0
    } else if (averageSpeed > 0) {
      prediction = remainingLength / averageSpeed
    }
    setPredictedMinutes(prediction)
  }, [view, isPaused])

  const resetCalculator = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }
    lengthHistoryRef.current = []
    setSpeed(0)
    setAvgSpeed(0)
    setPredictedMinutes(null)
    setIsPaused(false)
    if (view && !isPaused) {
      // isPaused가 false일 때만 초기 기록 추가 및 인터벌 시작
      lengthHistoryRef.current = [
        {
          timestamp: Date.now(),
          length: countTextLength(view.state.doc, CountType.NoSpacing),
        },
      ]
      // runCalculation(); // useEffect에서 isPaused 변경에 따라 처리
    }
  }, [view, isPaused]) // isPaused 의존성 추가

  const togglePause = useCallback(() => {
    setIsPaused((prevPaused) => {
      const newPausedState = !prevPaused
      if (!newPausedState && view) {
        // 측정 재개 시
        // lengthHistoryRef를 초기화하지 않고, 마지막 기록이 없다면 현재 시점으로 추가
        if (lengthHistoryRef.current.length === 0) {
          lengthHistoryRef.current = [
            {
              timestamp: Date.now(),
              length: countTextLength(view.state.doc, CountType.NoSpacing),
            },
          ]
        }
        // runCalculation(); // useEffect에서 isPaused 변경에 따라 처리
      }
      return newPausedState
    })
  }, [view])

  useEffect(() => {
    if (view && !isPaused) {
      if (lengthHistoryRef.current.length === 0) {
        lengthHistoryRef.current.push({
          timestamp: Date.now(),
          length: countTextLength(view.state.doc, CountType.NoSpacing),
        })
      }
      // 인터벌 시작 전에 한 번 실행하여 초기 값 표시 (선택적)
      // runCalculation();
      intervalIdRef.current = setInterval(
        runCalculation,
        CALCULATION_INTERVAL_MS,
      )
    } else {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
    }
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
    }
  }, [view, isPaused, runCalculation])

  const predictionText = useMemo(() => {
    if (isPaused && predictedMinutes !== 0) return "일시정지됨" // 목표 달성 시에는 "목표 달성!" 유지
    if (predictedMinutes === null) return "계산 중..."
    if (predictedMinutes === 0) return "목표 달성!"
    return `약 ${predictedMinutes.toFixed(1)}분 남음`
  }, [predictedMinutes, isPaused])

  return (
    <WidgetBase>
      <WidgetHeader>
        <HStack flex="1" cursor="grab" {...dragAttributes} {...dragListeners}>
          <Icon as={BsSpeedometer} />
          <WidgetTitle>속도계</WidgetTitle>
        </HStack>
        <Tooltip content={isPaused ? "측정 재개" : "측정 일시정지"}>
          <IconButton
            aria-label={isPaused ? "측정 재개" : "측정 일시정지"}
            size="xs"
            onClick={togglePause}
            variant="ghost"
          >
            {isPaused ? <MdPlayArrow /> : <MdPause />}
          </IconButton>
        </Tooltip>
        <Tooltip content={"측정 기록 초기화"}>
          <IconButton
            aria-label={"초기화"}
            size="xs"
            onClick={resetCalculator}
            variant="ghost"
          >
            <BiReset size={15} />
          </IconButton>
        </Tooltip>
      </WidgetHeader>
      <WidgetBody>
        <VStack w="100%" gap={2} align="stretch" px={3} py={2}>
          <HStack w="100%">
            <HStack w="100px" gap={1} flexShrink={0}>
              <Text fontSize="lg" fontWeight="bold">
                {speed}
              </Text>
              <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                자/분
              </Text>
            </HStack>
            {/* isPaused와 관계없이 speed 값 사용 */}
            <ProgressBar max={MAX_SPEED_DISPLAY} value={speed || 0} />
          </HStack>
          <HStack w="100%">
            <HStack w="100px" gap={1} flexShrink={0}>
              <Text fontSize="lg" fontWeight="bold">
                {avgSpeed}
              </Text>
              <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                평균 자/분
              </Text>
            </HStack>
            {/* isPaused와 관계없이 avgSpeed 값 사용 */}
            <ProgressBar max={MAX_SPEED_DISPLAY} value={avgSpeed || 0} />
          </HStack>
          <Text fontSize="xs" color="gray.500" textAlign="center" pt={1}>
            ({TARGET_LENGTH.toLocaleString()}자 기준) {predictionText}
          </Text>
        </VStack>
      </WidgetBody>
    </WidgetBase>
  )
}
