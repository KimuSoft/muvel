import React, { useCallback, useState, useEffect } from "react"
import {
  Center,
  HStack,
  IconButton,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  Text,
  VStack,
} from "@chakra-ui/react"
import { BsDice6Fill } from "react-icons/bs"
import { AiOutlineMinus } from "react-icons/ai"
import {
  GiDiceEightFacesEight,
  GiDiceTwentyFacesOne,
  GiPerspectiveDiceSixFacesOne,
} from "react-icons/gi"
import { BiCoin } from "react-icons/bi"

import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/containers/WidgetBase" // 경로 수정됨
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"
import { useSpecificWidgetSettings } from "~/hooks/useAppOptions"

export interface DiceInfo {
  id: string // 각 주사위 인스턴스를 위한 고유 ID
  max: number
  value: number
  color: string
}

export interface DiceWidgetOptions {
  dices: DiceInfo[]
}

const Dice: React.FC<{
  onChange(value: number): void // onChange는 이제 필수
  initialValue?: number
  max?: number
  colorScheme?: string
  isRollingGlobal: boolean // 다른 주사위가 굴려지는 중인지 여부
  onRollStart: () => void // 롤링 시작 알림
  onRollEnd: () => void // 롤링 종료 알림
}> = ({
  onChange,
  initialValue = 1,
  max = 6,
  colorScheme = "gray",
  isRollingGlobal,
  onRollStart,
  onRollEnd,
}) => {
  const [isRollingSelf, setIsRollingSelf] = useState(false) // 이 주사위 자체의 롤링 상태
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    // 롤링 중이 아닐 때만 initialValue로 내부 상태 업데이트
    if (!isRollingSelf && !isRollingGlobal) {
      setValue(initialValue)
    }
  }, [initialValue, isRollingSelf, isRollingGlobal])

  const onClick = useCallback(async () => {
    if (isRollingSelf || isRollingGlobal) return // 자신 또는 다른 주사위가 롤링 중이면 시작 안 함

    setIsRollingSelf(true)
    onRollStart() // 부모에게 롤링 시작 알림

    const rollIterations = 15
    const rollInterval = 70
    for (let i = 0; i < rollIterations; i++) {
      const randomValue = Math.floor(Math.random() * max) + 1
      setValue(randomValue)
      await new Promise((resolve) => setTimeout(resolve, rollInterval))
    }

    const finalValue = Math.floor(Math.random() * max) + 1
    setValue(finalValue)
    setIsRollingSelf(false)
    onChange(finalValue) // 부모에게 최종 값 알림
    onRollEnd() // 부모에게 롤링 종료 알림
  }, [isRollingSelf, isRollingGlobal, max, onChange, onRollStart, onRollEnd])

  return (
    <VStack gap={1}>
      <Center
        w="45px"
        h="45px"
        color={
          isRollingSelf ? { base: "gray.300", _dark: "gray.700" } : undefined
        }
        borderRadius={"md"}
        bgColor={{ base: `${colorScheme}.200`, _dark: `${colorScheme}.800` }}
        cursor={isRollingSelf || isRollingGlobal ? "default" : "pointer"}
        _hover={
          !isRollingSelf && !isRollingGlobal
            ? {
                bgColor: {
                  base: `${colorScheme}.300`,
                  _dark: `${colorScheme}.500`,
                },
              }
            : {}
        }
        transition={"background-color 0.2s"}
        userSelect={"none"}
        onClick={onClick}
        title={`d${max} 주사위 클릭해서 굴리기`}
      >
        <Text fontSize="lg" fontWeight="bold">
          {value}
        </Text>
      </Center>
      <Text color={"gray.500"} fontSize={"xs"}>
        d{max}
      </Text>
    </VStack>
  )
}

const WIDGET_ID = "dice"

const defaultDiceOptions: DiceWidgetOptions = {
  dices: [
    { id: crypto.randomUUID(), max: 6, value: 1, color: "gray" },
    { id: crypto.randomUUID(), max: 6, value: 1, color: "gray" },
  ],
}

export const DiceWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const [options, setOptions, resetOptions] =
    useSpecificWidgetSettings<DiceWidgetOptions>(WIDGET_ID, defaultDiceOptions)
  const { dices } = options

  // 어떤 주사위라도 굴려지고 있는지 전체적으로 관리하는 상태
  const [isAnyDiceRolling, setIsAnyDiceRolling] = useState(false)

  const handleRollStart = useCallback(() => {
    setIsAnyDiceRolling(true)
  }, [])

  const handleRollEnd = useCallback(() => {
    setIsAnyDiceRolling(false)
  }, [])

  const onAddDice = useCallback(
    (max: number, color: string = "gray") => {
      setOptions((draft) => {
        const newDice: DiceInfo = {
          id: crypto.randomUUID(),
          max,
          value: 1,
          color,
        }
        if (!draft.dices) {
          // dices 배열이 없을 경우 초기화
          draft.dices = []
        }
        draft.dices.push(newDice)
      })
    },
    [setOptions],
  )

  const onPopDice = useCallback(() => {
    setOptions((draft) => {
      if (draft.dices && draft.dices.length > 0) {
        draft.dices.pop()
      }
    })
  }, [setOptions])

  const onDiceChange = useCallback(
    (diceId: string, newValue: number) => {
      setOptions((draft) => {
        const diceIndex = draft.dices.findIndex((d) => d.id === diceId)
        if (diceIndex !== -1) {
          draft.dices[diceIndex].value = newValue
        }
      })
    },
    [setOptions],
  )

  return (
    <WidgetBase>
      <WidgetHeader>
        <HStack flex="1" cursor="grab" {...dragAttributes} {...dragListeners}>
          <BsDice6Fill />
          <WidgetTitle>주사위</WidgetTitle>
        </HStack>
        <MenuRoot>
          <MenuTrigger asChild>
            <IconButton
              aria-label={"주사위 추가"}
              size={"xs"}
              variant="ghost"
              disabled={isAnyDiceRolling}
            >
              <BsDice6Fill />
            </IconButton>
          </MenuTrigger>
          <MenuPositioner>
            <MenuContent minW="150px">
              <MenuItem value={"d2"} onClick={() => onAddDice(2, "yellow")}>
                <BiCoin size={16} style={{ marginRight: "8px" }} /> d2 (코인)
              </MenuItem>
              <MenuItem value={"d4"} onClick={() => onAddDice(4, "red")}>
                <GiPerspectiveDiceSixFacesOne
                  size={16}
                  style={{ marginRight: "8px" }}
                />{" "}
                d4
              </MenuItem>
              <MenuItem value={"d6"} onClick={() => onAddDice(6, "gray")}>
                <GiPerspectiveDiceSixFacesOne
                  size={16}
                  style={{ marginRight: "8px" }}
                />{" "}
                d6
              </MenuItem>
              <MenuItem value={"d8"} onClick={() => onAddDice(8, "blue")}>
                <GiDiceEightFacesEight
                  size={16}
                  style={{ marginRight: "8px" }}
                />{" "}
                d8
              </MenuItem>
              <MenuItem value={"d10"} onClick={() => onAddDice(10, "purple")}>
                <GiDiceEightFacesEight
                  size={16}
                  style={{ marginRight: "8px" }}
                />{" "}
                d10
              </MenuItem>
              <MenuItem value={"d12"} onClick={() => onAddDice(12, "orange")}>
                <GiDiceEightFacesEight
                  size={16}
                  style={{ marginRight: "8px" }}
                />{" "}
                d12
              </MenuItem>
              <MenuItem value={"d20"} onClick={() => onAddDice(20, "green")}>
                <GiDiceTwentyFacesOne
                  size={16}
                  style={{ marginRight: "8px" }}
                />{" "}
                d20
              </MenuItem>
              <MenuItem value={"d100"} onClick={() => onAddDice(100, "pink")}>
                <GiDiceTwentyFacesOne
                  size={16}
                  style={{ marginRight: "8px" }}
                />{" "}
                d100
              </MenuItem>
            </MenuContent>
          </MenuPositioner>
        </MenuRoot>
        <IconButton
          aria-label={"마지막 주사위 제거"}
          size={"xs"}
          onClick={onPopDice}
          disabled={!dices || dices.length === 0 || isAnyDiceRolling}
          variant="ghost"
        >
          <AiOutlineMinus />
        </IconButton>
      </WidgetHeader>
      <WidgetBody>
        <HStack
          w="full"
          overflowX={"auto"}
          py={2}
          px={1}
          gap={2}
          justifyContent={dices && dices.length > 0 ? "flex-start" : "center"}
          minHeight="85px"
          alignItems="flex-start"
        >
          {dices && dices.length > 0 ? (
            dices.map((dice) => (
              <Dice
                key={dice.id} // 각 주사위에 고유 ID 사용
                initialValue={dice.value}
                max={dice.max}
                colorScheme={dice.color}
                onChange={(newValue) => {
                  onDiceChange(dice.id, newValue)
                }}
                isRollingGlobal={isAnyDiceRolling} // 전역 롤링 상태 전달
                onRollStart={handleRollStart}
                onRollEnd={handleRollEnd}
              />
            ))
          ) : (
            <Center flex={1} h="full">
              <Text fontSize={"sm"} color={"gray.500"} userSelect={"none"}>
                + 버튼을 눌러 주사위를 추가해주세요
              </Text>
            </Center>
          )}
        </HStack>
      </WidgetBody>
    </WidgetBase>
  )
}
