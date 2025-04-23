import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { HStack, IconButton, Text, VStack } from "@chakra-ui/react"
import { BsSpeedometer } from "react-icons/bs"
import { BiReset } from "react-icons/bi"

// Base Widget Components & Types (경로 조정 필요)
import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/editor/widgets/components/WidgetBase"
import type { WidgetBaseProps } from "~/features/editor/widgets/components/widgetMap"
// Editor Context & Utils (경로 조정 필요)
import { useEditorContext } from "~/features/editor/context/EditorContext"
import {
  countTextLength,
  CountType,
} from "~/features/block-editor/utils/measureText"
// ProgressBar Component (경로 조정 필요)
import ProgressBar from "~/features/block-editor/components/atoms/ProgressBar"
import { Tooltip } from "~/components/ui/tooltip"

// --- 상수 정의 ---
const WIDGET_ID = "speedometer"
const TARGET_LENGTH = 3000 // 목표 글자 수 (공백 제외)
const CALCULATION_INTERVAL_MS = 1000 // 계산 주기 (1초)
const SPEED_CALC_SECONDS = 5 // 현재 속도 계산 기준 시간 (초)
const HISTORY_DURATION_SECONDS = 60 // 평균 속도 계산 및 기록 유지 시간 (초)
const MAX_SPEED_DISPLAY = 600 // 진행률 표시줄 최대 속도 (자/분)

// 글자 수 기록 타입
interface LengthRecord {
  timestamp: number // ms
  length: number // 글자 수 (공백 제외)
}

export const SpeedometerWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const { view } = useEditorContext() // ProseMirror view 가져오기

  const [speed, setSpeed] = useState<number>(0) // 현재 속도 (자/분)
  const [avgSpeed, setAvgSpeed] = useState<number>(0) // 평균 속도 (자/분)
  const [predictedMinutes, setPredictedMinutes] = useState<number | null>(null) // 예상 완료 시간 (분)

  // useRef를 사용하여 상태 변경 시 리렌더링을 유발하지 않도록 함
  const lengthHistoryRef = useRef<LengthRecord[]>([]) // 글자 수 변화 기록
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null) // 인터벌 ID 저장

  // 계산 및 상태 업데이트 로직
  const runCalculation = useCallback(() => {
    if (!view) return // view가 없으면 실행 중지

    const now = Date.now()
    const currentDoc = view.state.doc
    const currentLength = countTextLength(currentDoc, CountType.NoSpacing)

    // 최신 기록 추가
    const newHistory = [
      ...lengthHistoryRef.current,
      { timestamp: now, length: currentLength },
    ]

    // 오래된 기록 제거 (HISTORY_DURATION_SECONDS 초 이전 기록)
    const historyStartTime = now - HISTORY_DURATION_SECONDS * 1000
    const recentHistory = newHistory.filter(
      (record) => record.timestamp >= historyStartTime,
    )
    lengthHistoryRef.current = recentHistory // 기록 업데이트

    if (recentHistory.length < 2) {
      // 데이터 부족 시 초기화
      setSpeed(0)
      setAvgSpeed(0)
      setPredictedMinutes(null)
      return
    }

    // --- 현재 속도 계산 ---
    const speedCalcStartTime = now - SPEED_CALC_SECONDS * 1000
    // 기준 시간 이전 기록 중 가장 마지막 기록 찾기
    const recordBeforeSpeedStart = recentHistory
      .filter((r) => r.timestamp < speedCalcStartTime)
      .pop() // pop()은 마지막 요소를 반환하거나 undefined

    let currentSpeed = 0
    // 기준 시간 이전 기록이 있고, 그 이후 기록도 존재해야 계산 가능
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
        // 시간차가 있고, 글자수가 줄지 않았을 때만 계산
        currentSpeed = Math.round((lengthDiff / timeDiffSeconds) * 60) // 자/분 변환
      }
    }
    setSpeed(currentSpeed)

    // --- 평균 속도 계산 ---
    const firstRecord = recentHistory[0]
    const lastRecord = recentHistory[recentHistory.length - 1]
    const totalTimeDiffSeconds =
      (lastRecord.timestamp - firstRecord.timestamp) / 1000
    const totalLengthDiff = lastRecord.length - firstRecord.length

    let averageSpeed = 0
    if (totalTimeDiffSeconds > 0 && totalLengthDiff >= 0) {
      // 시간차가 있고, 글자수가 줄지 않았을 때만 계산
      averageSpeed = Math.round((totalLengthDiff / totalTimeDiffSeconds) * 60) // 자/분 변환
    }
    setAvgSpeed(averageSpeed)

    // --- 예상 시간 계산 ---
    const remainingLength = Math.max(0, TARGET_LENGTH - currentLength)
    let prediction: number | null = null
    if (remainingLength === 0) {
      prediction = 0 // 이미 목표 달성
    } else if (averageSpeed > 0) {
      prediction = remainingLength / averageSpeed // 남은 시간 (분)
    } // averageSpeed가 0이거나 음수면 null 유지 (계산 불가)

    setPredictedMinutes(prediction)
  }, [view]) // view가 변경되면 함수 재생성

  // 계산기 리셋 함수
  const resetCalculator = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }
    lengthHistoryRef.current = []
    setSpeed(0)
    setAvgSpeed(0)
    setPredictedMinutes(null)
    // 인터벌 다시 시작 (리셋 후에도 계속 측정하도록)
    intervalIdRef.current = setInterval(runCalculation, CALCULATION_INTERVAL_MS)
  }, [runCalculation])

  // 주기적 계산 설정 및 해제
  useEffect(() => {
    // view가 준비되면 인터벌 시작
    if (view) {
      // 초기 상태 반영을 위해 리셋 한번 호출
      resetCalculator()
      // intervalIdRef.current = setInterval(runCalculation, CALCULATION_INTERVAL_MS);
    }

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
    }
  }, [view, resetCalculator]) // view가 변경되면 인터벌 재설정

  // 예상 시간 표시 문자열 생성
  const predictionText = useMemo(() => {
    if (predictedMinutes === null) {
      return "계산 중..."
    }
    if (predictedMinutes === 0) {
      return "목표 달성!"
    }
    // 소수점 첫째 자리까지 표시
    return `약 ${predictedMinutes.toFixed(1)}분 남음`
  }, [predictedMinutes])

  return (
    <WidgetBase>
      {/* 헤더: 드래그 핸들 분리 */}
      <WidgetHeader>
        <HStack flex="1" cursor="grab" {...dragAttributes} {...dragListeners}>
          <BsSpeedometer />
          <WidgetTitle>속도계</WidgetTitle>
        </HStack>

        {/* 리셋 버튼 */}
        <Tooltip content={"측정 기록 초기화"}>
          {/* Chakra v3: Tooltip은 children을 직접 받음 */}
          <IconButton
            aria-label={"초기화"}
            size="xs"
            onClick={resetCalculator}
            variant="ghost" // icon prop 사용
          >
            <BiReset size={15} />
          </IconButton>
        </Tooltip>
      </WidgetHeader>

      {/* 본문 */}
      <WidgetBody>
        <VStack w="100%" gap={2} align="stretch" px={3} py={2}>
          {" "}
          {/* gap 사용 */}
          {/* 현재 속도 */}
          <HStack w="100%">
            <HStack w="100px" gap={1} flexShrink={0}>
              {" "}
              {/* 너비 고정 및 축소 방지 */}
              <Text fontSize="lg" fontWeight="bold">
                {speed}
              </Text>
              <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                자/분
              </Text>{" "}
              {/* 단위 */}
            </HStack>
            <ProgressBar max={MAX_SPEED_DISPLAY} value={speed || 0} />
          </HStack>
          {/* 평균 속도 */}
          <HStack w="100%">
            <HStack w="100px" gap={1} flexShrink={0}>
              <Text fontSize="lg" fontWeight="bold">
                {avgSpeed}
              </Text>
              <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                평균 자/분
              </Text>
            </HStack>
            <ProgressBar max={MAX_SPEED_DISPLAY} value={avgSpeed || 0} />
          </HStack>
          {/* 예상 시간 */}
          <Text fontSize="xs" color="gray.500" textAlign="center" pt={1}>
            ({TARGET_LENGTH.toLocaleString()}자 기준) {predictionText}
          </Text>
        </VStack>
      </WidgetBody>
    </WidgetBase>
  )
}

// 위젯 등록 부분은 widgetMap.ts에서 처리합니다.
// export const widgetMap = { ..., speedometer: SpeedometerWidget, ... };
// export type WidgetId = ... | "speedometer";
