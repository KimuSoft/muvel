import React, { useState } from "react"
import {
  Center,
  HStack,
  IconButton,
  Menu,
  MenuItem,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import { BsDice6Fill } from "react-icons/bs"
import { Widget, WidgetBody, WidgetHeader } from "./Widget"
import { AiOutlineMinus } from "react-icons/ai"
import {
  GiDiceEightFacesEight,
  GiDiceTwentyFacesOne,
  GiPerspectiveDiceSixFacesOne,
} from "react-icons/gi"
import { BiCoin } from "react-icons/bi"

const Dice: React.FC<{
  onChange?(value: number): unknown
  defaultValue?: number
  max?: number
  colorScheme?: string
}> = ({ onChange, defaultValue = 1, max = 6, colorScheme = "gray" }) => {
  const [isRolling, setIsRolling] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue)

  const onClick = async () => {
    if (isRolling) return
    setIsRolling(true)

    // loop 10 times
    for (let i = 0; i < 15; i++) {
      const value_ = Math.floor(Math.random() * max) + 1
      setValue(value_)
      await new Promise((resolve) => setTimeout(resolve, 70))
    }

    const value_ = Math.floor(Math.random() * max) + 1

    setValue(value_)
    setIsRolling(false)
    onChange?.(value_)
  }

  return (
    <VStack gap={1}>
      <Center
        w="50px"
        h="50px"
        color={isRolling ? { base: "gray.300", _dark: "gray.700" } : undefined}
        borderRadius={"xl"}
        bgColor={{ base: colorScheme + ".200", _dark: colorScheme + ".600" }}
        cursor={isRolling ? "default" : "pointer"}
        _hover={{
          bgColor: { base: colorScheme + ".300", _dark: colorScheme + ".500" },
        }}
        transition={"background-color 0.2s"}
        userSelect={"none"}
        onClick={onClick}
      >
        <Text>{value}</Text>
      </Center>
      <Text color={"gray.500"} fontSize={"xs"}>
        d{max}
      </Text>
    </VStack>
  )
}

const DiceWidget: React.FC = () => {
  const [dices, setDices] = useState<
    { max: number; value: number; color: string }[]
  >([
    { max: 6, value: 1, color: "gray" },
    { max: 6, value: 1, color: "gray" },
  ])

  const onAddDice = (max: number, color: string = "gray") => {
    setDices((prev) => [...prev, { max, value: 1, color: color }])
  }

  const onPopDice = () => {
    setDices((prev) => prev.slice(0, prev.length - 1))
  }

  return (
    <Widget>
      <WidgetHeader>
        <BsDice6Fill />
        <Text>주사위 위젯</Text>
        <Spacer />
        <Menu.Root>
          <Menu.Trigger>
            <IconButton aria-label={"add dice"} size={"xs"}>
              <BsDice6Fill />
            </IconButton>
          </Menu.Trigger>
          <Menu.Content fontSize={"md"}>
            <Menu.Item value={"d2"} onClick={() => onAddDice(2)}>
              <BiCoin size={16} /> d2 주사위 (코인)
            </Menu.Item>
            <Menu.Item value={"d4"} onClick={() => onAddDice(4)}>
              <GiPerspectiveDiceSixFacesOne size={16} />
              d4 주사위
            </Menu.Item>
            <Menu.Item value={"d6"} onClick={() => onAddDice(6)}>
              <GiPerspectiveDiceSixFacesOne size={16} />
              d6 주사위
            </Menu.Item>
            <Menu.Item value={"d8"} onClick={() => onAddDice(8)}>
              <GiDiceEightFacesEight size={16} />
              d8 주사위
            </Menu.Item>
            <Menu.Item value={"d10"} onClick={() => onAddDice(10)}>
              <GiDiceEightFacesEight size={16} />
              d10 주사위
            </Menu.Item>
            <Menu.Item value={"d12"} onClick={() => onAddDice(12)}>
              <GiDiceEightFacesEight size={16} />
              d12 주사위
            </Menu.Item>
            <Menu.Item value={"d20"} onClick={() => onAddDice(20)}>
              <GiDiceTwentyFacesOne size={16} />
              d20 주사위
            </Menu.Item>
            <MenuItem value={"d100"} onClick={() => onAddDice(100)}>
              <GiDiceTwentyFacesOne size={16} />
              d100 주사위
            </MenuItem>
          </Menu.Content>
        </Menu.Root>
        <IconButton aria-label={"del dice"} size={"xs"} onClick={onPopDice}>
          <AiOutlineMinus />
        </IconButton>
      </WidgetHeader>
      <WidgetBody>
        <HStack w="120%" justifyContent={"center"} overflowX={"auto"}>
          {dices.length ? (
            dices.map((dice, i) => (
              <Dice
                key={i}
                defaultValue={dice.value}
                max={dice.max}
                colorScheme={dice.color}
                onChange={(value) => {
                  setDices((prev) =>
                    prev.map((d, j) => (i === j ? { ...d, value } : d)),
                  )
                }}
              />
            ))
          ) : (
            <Text fontSize={"sm"} color={"gray.500"} userSelect={"none"}>
              + 버튼을 눌러 주사위를 추가해주세요
            </Text>
          )}
        </HStack>
      </WidgetBody>
    </Widget>
  )
}

export default DiceWidget
