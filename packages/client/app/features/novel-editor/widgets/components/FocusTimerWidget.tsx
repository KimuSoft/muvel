// app/features/novel-editor/widgets/components/FocusTimerWidget.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button, Group, HStack, Icon, Text, VStack } from "@chakra-ui/react"
import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/containers/WidgetBase"
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"
import { toaster } from "~/components/ui/toaster"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import { useSpecificWidgetSettings } from "~/hooks/useAppOptions"
import ProgressBar from "~/components/atoms/ProgressBar"
import { FaFire } from "react-icons/fa6"

export const FOCUS_TIMER_WIDGET_ID = "focusTimer"
const MAX_SECONDS = 999 * 60 + 59
const INACTIVITY_TIMEOUT_MS = 15 * 1000

export interface FocusTimerWidgetOptions {
  lastPureWritingTime: number
  lastTotalTime: number
  lastFocusRate: number
}

const defaultFocusTimerOptions: FocusTimerWidgetOptions = {
  lastPureWritingTime: 0,
  lastTotalTime: 0,
  lastFocusRate: 0,
}

export const FocusTimerWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const { view } = useEditorContext()
  const [_options, setOptions] =
    useSpecificWidgetSettings<FocusTimerWidgetOptions>(
      FOCUS_TIMER_WIDGET_ID,
      defaultFocusTimerOptions,
    )

  const [totalSeconds, setTotalSeconds] = useState(0)
  const [pureWritingSeconds, setPureWritingSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isWriting, setIsWriting] = useState(false) // UI 피드백용 (실제 카운트 로직은 lastInputTimeRef 기반)

  const lastInputTimeRef = useRef<number>(Date.now())
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)

  // Refs for state values to be used in setInterval and other callbacks
  const totalSecondsRef = useRef(totalSeconds)
  const pureWritingSecondsRef = useRef(pureWritingSeconds)
  const isActiveRef = useRef(isActive)
  const isWritingRef = useRef(isWriting)
  const focusRateRef = useRef(0)

  useEffect(() => {
    totalSecondsRef.current = totalSeconds
  }, [totalSeconds])

  useEffect(() => {
    pureWritingSecondsRef.current = pureWritingSeconds
  }, [pureWritingSeconds])

  useEffect(() => {
    isActiveRef.current = isActive
  }, [isActive])

  useEffect(() => {
    isWritingRef.current = isWriting
  }, [isWriting])

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const remainingSeconds = timeInSeconds % 60
    const displayMinutes = String(minutes).padStart(2, "0")
    const displaySeconds = String(remainingSeconds).padStart(2, "0")
    return `${displayMinutes}:${displaySeconds}`
  }

  const formattedTotalTime = useMemo(
    () => formatTime(totalSeconds),
    [totalSeconds],
  )
  const formattedPureWritingTime = useMemo(
    () => formatTime(pureWritingSeconds),
    [pureWritingSeconds],
  )

  const focusRate = useMemo(() => {
    if (totalSeconds === 0) return 0
    return Math.floor((pureWritingSeconds / totalSeconds) * 100)
  }, [pureWritingSeconds, totalSeconds])

  useEffect(() => {
    focusRateRef.current = focusRate
  }, [focusRate])

  const startWritingSession = useCallback(() => {
    lastInputTimeRef.current = Date.now()
    if (!isWritingRef.current) {
      // Check ref before setting state
      setIsWriting(true)
    }
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    inactivityTimerRef.current = setTimeout(() => {
      setIsWriting(false)
    }, INACTIVITY_TIMEOUT_MS)
  }, []) // setIsWriting is stable

  useEffect(() => {
    if (!view || !isActive) {
      setIsWriting(false)
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
        inactivityTimerRef.current = null
      }
      return
    }

    const onKeyDownHandler = () => {
      startWritingSession()
    }

    const editorDom = view.dom
    editorDom.addEventListener("keydown", onKeyDownHandler)
    startWritingSession() // 타이머가 활성화될 때 초기 입력 세션 시작

    return () => {
      editorDom.removeEventListener("keydown", onKeyDownHandler)
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
        inactivityTimerRef.current = null
      }
    }
  }, [view, isActive, startWritingSession])

  useEffect(() => {
    if (isActiveRef.current) {
      intervalIdRef.current = setInterval(() => {
        setTotalSeconds((prevTotal) => {
          if (prevTotal >= MAX_SECONDS - 1) {
            if (isActiveRef.current) {
              // Check ref
              toaster.warning({ title: "최대 측정 시간에 도달했습니다." })
              setIsActive(false) // Update state
              setOptions((opt) => ({
                ...opt,
                lastTotalTime: MAX_SECONDS,
                lastPureWritingTime: pureWritingSecondsRef.current,
                lastFocusRate: focusRateRef.current,
              }))
            }
            return MAX_SECONDS
          }
          return prevTotal + 1
        })

        if (Date.now() - lastInputTimeRef.current < INACTIVITY_TIMEOUT_MS) {
          setPureWritingSeconds((prevPure) => {
            if (
              prevPure < totalSecondsRef.current &&
              totalSecondsRef.current < MAX_SECONDS
            ) {
              return prevPure + 1
            }
            return prevPure
          })
        }
      }, 1000)
    } else {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
    }
  }, [isActive, setOptions]) // isActive (state) is the primary dependency here

  const toggleTimer = useCallback(() => {
    setIsActive((prevIsActive) => {
      const newIsActive = !prevIsActive
      if (newIsActive) {
        startWritingSession() // 타이머 시작 시 입력 세션 시작
      } else {
        if (totalSecondsRef.current > 0) {
          setOptions((opt) => ({
            ...opt,
            lastTotalTime: totalSecondsRef.current,
            lastPureWritingTime: pureWritingSecondsRef.current,
            lastFocusRate: focusRateRef.current,
          }))
        }
        setIsWriting(false) // 타이머 중지 시 명시적으로 false
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current)
          inactivityTimerRef.current = null
        }
      }
      return newIsActive
    })
  }, [startWritingSession, setOptions])

  const resetTimer = useCallback(() => {
    if (totalSecondsRef.current > 0 || pureWritingSecondsRef.current > 0) {
      setOptions((opt) => ({
        ...opt,
        lastTotalTime: totalSecondsRef.current,
        lastPureWritingTime: pureWritingSecondsRef.current,
        lastFocusRate: focusRateRef.current,
      }))
    }
    setTotalSeconds(0)
    setPureWritingSeconds(0)
    setIsActive(false)
    setIsWriting(false)
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = null
    }
  }, [setOptions])

  return (
    <WidgetBase>
      <WidgetHeader {...dragAttributes} {...dragListeners}>
        <Icon as={FaFire} />
        <WidgetTitle>집중도 측정기</WidgetTitle>
      </WidgetHeader>
      <WidgetBody>
        <VStack gap={0} align="stretch">
          <VStack gap={0} align="center">
            <Text
              fontSize="3xl"
              fontWeight="bold"
              textAlign="center"
              lineHeight={1.2}
            >
              {formattedPureWritingTime}
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              (총 측정 시간: {formattedTotalTime})
            </Text>
          </VStack>

          <VStack gap={1} align="stretch">
            <HStack justifyContent="space-between">
              <Text fontSize="xs" color="gray.500">
                집중률
              </Text>
              <Text
                fontSize="sm"
                fontWeight="bold"
                color={isWriting && isActive ? "purple.500" : "gray.500"}
              >
                {focusRate}% {isWriting && isActive && "(집중 중)"}
              </Text>
            </HStack>
            <ProgressBar
              value={focusRate / 100}
              colorPalette={isWriting && isActive ? "purple" : "gray"}
            />
          </VStack>

          <HStack gap={2} mt={3}>
            <Group w={"100%"} attached>
              <Button
                onClick={toggleTimer}
                colorScheme={isActive ? "yellow" : "green"}
                flex={1}
                variant={"outline"}
                size={"xs"}
                disabled={!view}
              >
                {isActive ? "일시정지" : "시작"}
              </Button>
              <Button
                onClick={resetTimer}
                disabled={totalSeconds === 0 && !isActive}
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
