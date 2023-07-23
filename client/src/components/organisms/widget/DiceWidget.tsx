import React from "react"
import {
  Center,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react"
import { BsDice6Fill } from "react-icons/bs"
import { Widget, WidgetBody, WidgetHeader } from "./Widget"
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai"
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

  const rollingColor = useColorModeValue("gray.300", "gray.700")

  return (
    <VStack gap={1}>
      <Center
        w="50px"
        h="50px"
        color={isRolling ? rollingColor : undefined}
        borderRadius={"xl"}
        bgColor={useColorModeValue(colorScheme + ".200", colorScheme + ".600")}
        cursor={isRolling ? "default" : "pointer"}
        _hover={{
          bgColor: useColorModeValue(
            colorScheme + ".300",
            colorScheme + ".500"
          ),
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
  const [dices, setDices] = React.useState<
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
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label={"add dice"}
            size={"xs"}
            icon={<AiOutlinePlus />}
          />
          <MenuList fontSize={"md"}>
            <MenuItem icon={<BiCoin size={16} />} onClick={() => onAddDice(2)}>
              d2 주사위 (코인)
            </MenuItem>
            <MenuItem
              icon={<GiPerspectiveDiceSixFacesOne size={16} />}
              onClick={() => onAddDice(4)}
            >
              d4 주사위
            </MenuItem>
            <MenuItem
              icon={<GiPerspectiveDiceSixFacesOne size={16} />}
              onClick={() => onAddDice(6)}
            >
              d6 주사위
            </MenuItem>
            <MenuItem
              icon={<GiDiceEightFacesEight size={16} />}
              onClick={() => onAddDice(8)}
            >
              d8 주사위
            </MenuItem>
            <MenuItem
              icon={<GiDiceEightFacesEight size={16} />}
              onClick={() => onAddDice(10)}
            >
              d10 주사위
            </MenuItem>
            <MenuItem
              icon={<GiDiceEightFacesEight size={16} />}
              onClick={() => onAddDice(12)}
            >
              d12 주사위
            </MenuItem>
            <MenuItem
              icon={<GiDiceTwentyFacesOne size={16} />}
              onClick={() => onAddDice(20)}
            >
              d20 주사위
            </MenuItem>
            <MenuItem
              icon={<GiDiceTwentyFacesOne size={16} />}
              onClick={() => onAddDice(100)}
            >
              d100 주사위
            </MenuItem>
          </MenuList>
        </Menu>
        <IconButton
          aria-label={"del dice"}
          size={"xs"}
          onClick={onPopDice}
          icon={<AiOutlineMinus />}
        />
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
                    prev.map((d, j) => (i === j ? { ...d, value } : d))
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
