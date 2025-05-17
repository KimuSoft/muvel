// app/features/novel-editor/widgets/components/TimerWidget.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  Button,
  Text,
  HStack,
  VStack,
  Group,
  IconButton,
  NumberInput,
  Menu,
  Icon,
  Box,
} from "@chakra-ui/react"
import { FaStopwatch, FaVolumeMute, FaVolumeUp } from "react-icons/fa"
import { Howl } from "howler"

import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "../containers/WidgetBase"
import type { WidgetBaseProps } from "./widgetMap"
import { toaster } from "~/components/ui/toaster"
import ProgressBar from "~/components/atoms/ProgressBar"
import { MdPause, MdPlayArrow } from "react-icons/md"
import { IoMdRefresh } from "react-icons/io"
import { Tooltip } from "~/components/ui/tooltip"
import { useSpecificWidgetSettings } from "~/hooks/useAppOptions"

export interface TimerWidgetOptions {
  duration: number
  remainingTime: number
  isRunning: boolean
  isFinished: boolean
  alarmSoundEnabled: boolean
}

const WIDGET_ID = "timer"

const defaultTimerOptions: TimerWidgetOptions = {
  duration: 5 * 60,
  remainingTime: 5 * 60,
  isRunning: false,
  isFinished: false,
  alarmSoundEnabled: true,
}

const alarmSoundPath = "/sounds/timer_alarm.mp3"

const secondsToHMS = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { hours, minutes, seconds }
}

interface TimeDisplayAndMenuProps {
  formattedTime: string
  disabled?: boolean
  duration: number
  isRunning: boolean
  onTimeSet: (h: number, m: number, s: number) => void
}

const TimeDisplayAndMenu: React.FC<TimeDisplayAndMenuProps> = ({
  formattedTime,
  disabled,
  duration,
  isRunning,
  onTimeSet,
}) => {
  const [currentInputHours, setCurrentInputHours] = useState(
    () => secondsToHMS(duration).hours,
  )
  const [currentInputMinutes, setCurrentInputMinutes] = useState(
    () => secondsToHMS(duration).minutes,
  )
  const [currentInputSeconds, setCurrentInputSeconds] = useState(
    () => secondsToHMS(duration).seconds,
  )

  useEffect(() => {
    if (!isRunning) {
      const hms = secondsToHMS(duration)
      setCurrentInputHours(hms.hours)
      setCurrentInputMinutes(hms.minutes)
      setCurrentInputSeconds(hms.seconds)
    }
  }, [duration, isRunning])

  useEffect(() => {
    if (!isRunning) {
      onTimeSet(currentInputHours, currentInputMinutes, currentInputSeconds)
    }
  }, [
    currentInputHours,
    currentInputMinutes,
    currentInputSeconds,
    onTimeSet,
    isRunning,
  ])

  const handleMenuOpenChange = (details: { open: boolean }) => {
    if (details.open && !isRunning) {
      const hms = secondsToHMS(duration)
      setCurrentInputHours(hms.hours)
      setCurrentInputMinutes(hms.minutes)
      setCurrentInputSeconds(hms.seconds)
    }
  }

  const triggerContent = (
    <Text
      fontSize="4xl"
      fontWeight="bold"
      textAlign="center"
      cursor={disabled ? "default" : "pointer"}
      userSelect="none"
      _hover={disabled ? {} : { opacity: 0.8 }}
      title={disabled ? "타이머 실행 중" : "클릭하여 시간 설정"}
    >
      {formattedTime}
    </Text>
  )

  if (disabled) {
    return <Box>{triggerContent}</Box>
  }

  return (
    <Menu.Root closeOnSelect={false} onOpenChange={handleMenuOpenChange}>
      <Menu.Trigger asChild>{triggerContent}</Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <VStack p={3} gap={3} alignItems="stretch">
            <Text fontSize="sm" fontWeight="medium">
              시간 설정 (시 : 분 : 초)
            </Text>
            <HStack w={"250px"}>
              <NumberInput.Root
                size="sm"
                value={(currentInputHours || 0).toString()}
                onValueChange={(details) =>
                  setCurrentInputHours(details.valueAsNumber || 0)
                }
                min={0}
                max={99}
                clampValueOnBlur={false}
              >
                <NumberInput.Control />
                <NumberInput.Input placeholder="시" />
              </NumberInput.Root>
              <Text>:</Text>
              <NumberInput.Root
                size="sm"
                value={(currentInputMinutes || 0).toString()}
                onValueChange={(details) =>
                  setCurrentInputMinutes(details.valueAsNumber || 0)
                }
                min={0}
                max={59}
                clampValueOnBlur={false}
              >
                <NumberInput.Control />
                <NumberInput.Input placeholder="분" />
              </NumberInput.Root>
              <Text>:</Text>
              <NumberInput.Root
                size="sm"
                value={(currentInputSeconds || 0).toString()}
                onValueChange={(details) =>
                  setCurrentInputSeconds(details.valueAsNumber || 0)
                }
                min={0}
                max={59}
                clampValueOnBlur={false}
              >
                <NumberInput.Control />
                <NumberInput.Input placeholder="초" />
              </NumberInput.Root>
            </HStack>
          </VStack>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  )
}

export const TimerWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const [options, setOptions] = useSpecificWidgetSettings<TimerWidgetOptions>(
    WIDGET_ID,
    defaultTimerOptions,
  )

  const { duration, remainingTime, isRunning, isFinished, alarmSoundEnabled } =
    options

  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)
  const alarmSoundRef = useRef<Howl | null>(null)
  const finishActionsPerformedRef = useRef(false) // 타이머 종료 액션 실행 여부 플래그

  useEffect(() => {
    alarmSoundRef.current = new Howl({
      src: [alarmSoundPath],
      volume: 0.7,
    })
    return () => {
      alarmSoundRef.current?.unload()
    }
  }, [])

  useEffect(() => {
    if (isRunning && remainingTime > 0) {
      // console.log(`Timer Interval Started: remainingTime=${remainingTime}, isRunning=${isRunning}, finishActionsPerformedRef=${finishActionsPerformedRef.current}`);
      intervalIdRef.current = setInterval(() => {
        setOptions((draft) => {
          // console.log(`Interval Tick: draft.remainingTime=${draft.remainingTime}, draft.isRunning=${draft.isRunning}, finishActionsPerformedRef=${finishActionsPerformedRef.current}`);
          if (draft.remainingTime > 0) {
            draft.remainingTime -= 1

            if (draft.remainingTime === 0) {
              // console.log(`Remaining time is 0. finishActionsPerformedRef=${finishActionsPerformedRef.current}`);
              draft.isRunning = false // 타이머 중지
              draft.isFinished = true // 완료 상태로 변경

              if (!finishActionsPerformedRef.current) {
                // 플래그 확인
                // console.log("Executing finish actions: Sound and Toaster");
                if (draft.alarmSoundEnabled && alarmSoundRef.current) {
                  alarmSoundRef.current.play()
                }
                toaster.info({
                  title: "타이머 종료!",
                  description: "설정한 시간이 모두 지났습니다.",
                })
                finishActionsPerformedRef.current = true // 플래그 설정
              }

              if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current)
                intervalIdRef.current = null
              }
            }
          }
        })
      }, 1000)
    } else {
      // isRunning이 false이거나 remainingTime이 0 이하인 경우
      if (intervalIdRef.current) {
        // console.log("Clearing interval outside main loop");
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
      // 타이머가 멈췄고, 시간이 다 됐는데, 아직 완료 처리가 안된 경우 (예: 외부에서 isRunning 변경)
      if (remainingTime <= 0 && !isRunning && !isFinished) {
        // console.log("Correcting state: Timer stopped, time up, but not marked finished.");
        setOptions((draft) => {
          draft.isFinished = true
          // 이 경우, 카운트다운으로 0이 된 것이 아니므로, 알람/토스터는 여기서 발생시키지 않음.
          // 만약 duration이 0으로 설정되어 바로 끝나는 경우라면 finishActionsPerformedRef가 false일 수 있음.
          if (draft.duration === 0 && !finishActionsPerformedRef.current) {
            // console.log("Duration is 0, marking finish actions as performed.");
            finishActionsPerformedRef.current = true
          }
        })
      }
    }

    return () => {
      if (intervalIdRef.current) {
        // console.log("Clearing interval on cleanup");
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
    }
  }, [
    isRunning,
    remainingTime,
    setOptions,
    alarmSoundEnabled,
    isFinished,
    duration,
  ]) // duration, isFinished 추가

  const handleStartPause = useCallback(() => {
    setOptions((draft) => {
      if (draft.isFinished || draft.remainingTime === 0) {
        // draft 값으로 조건 확인
        // console.log("Timer restarting via Start/Pause button");
        draft.remainingTime = draft.duration
        draft.isRunning = true
        draft.isFinished = false
        finishActionsPerformedRef.current = false // 종료 액션 플래그 리셋
      } else {
        draft.isRunning = !draft.isRunning
        // console.log(`Timer toggled: isRunning=${draft.isRunning}`);
      }
    })
  }, [setOptions]) // options에서 필요한 값만 의존성으로 넣거나, options 전체를 넣고 useCallback 최적화 주의

  const handleReset = useCallback(() => {
    // console.log("Timer reset");
    setOptions((draft) => {
      draft.remainingTime = draft.duration
      draft.isRunning = false
      draft.isFinished = false
      finishActionsPerformedRef.current = false // 종료 액션 플래그 리셋
    })
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }
  }, [setOptions]) // options.duration 대신 draft.duration 사용하므로 setOptions만 의존

  const handleTimeSetFromMenu = useCallback(
    (h: number, m: number, s: number) => {
      const newDurationInSeconds = h * 3600 + m * 60 + s
      setOptions((draft) => {
        const newValidDuration = Math.max(0, newDurationInSeconds)
        // console.log(`Time set from menu: newDuration=${newValidDuration}s. Current isRunning=${draft.isRunning}`);
        draft.duration = newValidDuration
        if (!draft.isRunning) {
          draft.remainingTime = newValidDuration
          draft.isFinished = false
          finishActionsPerformedRef.current = false // 시간 변경 시 플래그 리셋 (타이머가 멈춘 경우에만)
          // console.log(`  ㄴ Timer not running, remainingTime and flags reset. finishActionsPerformedRef=${finishActionsPerformedRef.current}`);
        }
      })
    },
    [setOptions],
  )

  const toggleAlarmSound = useCallback(() => {
    setOptions((draft) => {
      draft.alarmSoundEnabled = !draft.alarmSoundEnabled
      // console.log(`Alarm sound toggled: ${draft.alarmSoundEnabled}`);
    })
  }, [setOptions])

  const formattedTime = useMemo(() => {
    const { hours, minutes, seconds } = secondsToHMS(remainingTime)
    const hStr = String(hours).padStart(2, "0")
    const mStr = String(minutes).padStart(2, "0")
    const sStr = String(seconds).padStart(2, "0")

    if (duration >= 3600 || hours > 0) {
      return `${hStr}:${mStr}:${sStr}`
    }
    return `${mStr}:${sStr}`
  }, [remainingTime, duration])

  const progressPercentage = useMemo(() => {
    if (duration === 0) return 0
    return ((duration - remainingTime) / duration) * 100
  }, [duration, remainingTime])

  return (
    <WidgetBase>
      <WidgetHeader>
        <HStack flex="1" cursor="grab" {...dragAttributes} {...dragListeners}>
          <Icon as={FaStopwatch} />
          <WidgetTitle>타이머</WidgetTitle>
        </HStack>
        <Tooltip
          content={alarmSoundEnabled ? "알람 소리 끄기" : "알람 소리 켜기"}
        >
          <IconButton
            aria-label="알람 소리 토글"
            size="xs"
            variant="ghost"
            onClick={toggleAlarmSound}
          >
            {alarmSoundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
          </IconButton>
        </Tooltip>
      </WidgetHeader>
      <WidgetBody>
        <VStack gap={2} align="stretch">
          <TimeDisplayAndMenu
            formattedTime={formattedTime}
            disabled={isRunning}
            duration={duration}
            isRunning={isRunning}
            onTimeSet={handleTimeSetFromMenu}
          />
          <ProgressBar
            value={progressPercentage / 100}
            colorPalette={isFinished ? "red" : "purple"}
          />
          <HStack gap={2}>
            <Group w="100%" attached>
              <Button
                onClick={handleStartPause}
                colorPalette={"purple"}
                flex={1}
                variant="outline"
                size={"xs"}
              >
                {isRunning ? <MdPause /> : <MdPlayArrow />}
                <Text as="span" ml={1}>
                  {isRunning
                    ? "일시정지"
                    : isFinished || remainingTime === 0
                      ? "다시시작"
                      : "시작"}
                </Text>
              </Button>
              <Button
                onClick={handleReset}
                disabled={
                  remainingTime === duration && !isRunning && !isFinished
                }
                flex={1}
                size="xs"
                variant="outline"
              >
                <IoMdRefresh />
                <Text as="span" ml={1}>
                  초기화
                </Text>
              </Button>
            </Group>
          </HStack>
        </VStack>
      </WidgetBody>
    </WidgetBase>
  )
}
