import React, { useState, useCallback, useMemo } from "react"
import {
  Center,
  HStack,
  IconButton,
  MenuRoot, // Chakra v3 Menu Components
  MenuTrigger,
  MenuPositioner,
  MenuContent,
  MenuItem,
  // Spacer,        // Spacer 대신 HStack flex=1 사용
  Text,
  VStack,
} from "@chakra-ui/react"
// Icons
import { BsDice6Fill } from "react-icons/bs"
import { AiOutlineMinus } from "react-icons/ai"
import {
  GiDiceEightFacesEight,
  GiDiceTwentyFacesOne,
  GiPerspectiveDiceSixFacesOne,
} from "react-icons/gi"
import { BiCoin } from "react-icons/bi"

// Base Widget Components (경로는 실제 프로젝트 구조에 맞게 조정)
import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/components/WidgetBase"
// Context Hook (경로는 실제 프로젝트 구조에 맞게 조정)
import { useWidgetOption } from "~/features/novel-editor/widgets/context/WidgetContext"
// Base Props Type (경로는 실제 프로젝트 구조에 맞게 조정)
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"

// --- 타입 정의 시작 ---

// 단일 주사위 정보 타입
export interface DiceInfo {
  max: number
  value: number
  color: string
}

// 주사위 위젯 옵션 타입
export interface DiceWidgetOptions {
  dices: DiceInfo[]
}

// --- 타입 정의 끝 ---

// --- 단일 주사위 컴포넌트 시작 ---
// 이 컴포넌트는 위젯 내부에서만 사용되므로 export하지 않을 수 있음
const Dice: React.FC<{
  onChange?(value: number): unknown
  defaultValue?: number
  max?: number
  colorScheme?: string
}> = ({ onChange, defaultValue = 1, max = 6, colorScheme = "gray" }) => {
  const [isRolling, setIsRolling] = useState(false)
  // defaultValue가 변경될 때 value 상태도 업데이트되도록 useEffect 추가 (선택적)
  const [value, setValue] = useState(defaultValue)
  React.useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const onClick = useCallback(async () => {
    if (isRolling) return
    setIsRolling(true)

    // 롤링 애니메이션
    const rollIterations = 15
    const rollInterval = 70 // ms
    for (let i = 0; i < rollIterations; i++) {
      // 애니메이션 중에는 실제 값과 다른 값을 보여줄 수 있음
      const randomValue = Math.floor(Math.random() * max) + 1
      setValue(randomValue)
      await new Promise((resolve) => setTimeout(resolve, rollInterval))
    }

    // 최종 결과 계산
    const finalValue = Math.floor(Math.random() * max) + 1
    setValue(finalValue)
    setIsRolling(false)
    onChange?.(finalValue) // 최종 값으로 onChange 호출
  }, [isRolling, max, onChange]) // 의존성 배열 업데이트

  return (
    <VStack gap={1}>
      <Center
        w="50px"
        h="50px"
        color={isRolling ? { base: "gray.300", _dark: "gray.700" } : undefined}
        borderRadius={"xl"}
        // colorScheme prop이 안전하게 적용되도록 template literal 사용
        bgColor={{ base: `${colorScheme}.200`, _dark: `${colorScheme}.600` }}
        cursor={isRolling ? "default" : "pointer"}
        _hover={
          !isRolling
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
        title={`d${max} 주사위 클릭해서 굴리기`} // 툴팁 추가
      >
        {/* 텍스트 스타일 약간 강조 */}
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
// --- 단일 주사위 컴포넌트 끝 ---

// --- 주사위 위젯 컴포넌트 시작 ---

const WIDGET_ID = "dice"

// 기본 옵션 정의
const defaultDiceOptions: DiceWidgetOptions = {
  dices: [
    { max: 6, value: 1, color: "gray" },
    { max: 6, value: 1, color: "gray" },
  ],
}

export const DiceWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners, // dnd-kit props
}) => {
  // 위젯 옵션 상태 관리
  const [options, setOptions] = useWidgetOption<DiceWidgetOptions>(
    WIDGET_ID,
    defaultDiceOptions,
  )
  const { dices } = options // 현재 주사위 목록

  // 주사위 추가 핸들러
  const onAddDice = useCallback(
    (max: number, color: string = "gray") => {
      setOptions((draft) => {
        const newDice: DiceInfo = { max, value: 1, color } // 새 주사위는 항상 값 1로 시작
        draft.dices.push(newDice)
      })
    },
    [setOptions],
  ) // setOptions는 참조가 안정적이므로 의존성 배열에 넣음

  // 마지막 주사위 제거 핸들러
  const onPopDice = useCallback(() => {
    setOptions((draft) => {
      if (draft.dices.length > 0) {
        draft.dices.pop() // immer draft는 pop 메서드 직접 사용 가능
      }
    })
  }, [setOptions])

  // 특정 주사위 값 변경 핸들러 (Dice 컴포넌트의 onChange에서 호출됨)
  const onDiceChange = useCallback(
    (index: number, newValue: number) => {
      setOptions((draft) => {
        // 해당 인덱스의 주사위가 존재하는지 확인 후 값 업데이트
        if (draft.dices[index]) {
          draft.dices[index].value = newValue
        }
      })
    },
    [setOptions],
  )

  return (
    <WidgetBase>
      {/* WidgetHeader: 드래그 핸들은 내부 HStack에만 적용 */}
      <WidgetHeader>
        {/* 드래그 핸들 영역 (아이콘 + 제목) */}
        <HStack flex="1" cursor="grab" {...dragAttributes} {...dragListeners}>
          <BsDice6Fill />
          <WidgetTitle>주사위</WidgetTitle>
        </HStack>

        {/* 메뉴 버튼 */}
        <MenuRoot>
          <MenuTrigger asChild>
            <IconButton aria-label={"주사위 추가"} size={"xs"} variant="ghost">
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

        {/* 제거 버튼 */}
        <IconButton
          aria-label={"마지막 주사위 제거"}
          size={"xs"}
          onClick={onPopDice}
          disabled={dices.length === 0} // Chakra v3: disabled 사용
          variant="ghost"
        >
          <AiOutlineMinus />
        </IconButton>
      </WidgetHeader>

      {/* 위젯 본문 */}
      <WidgetBody>
        <HStack
          w="full" // 너비 100%
          overflowX={"auto"} // 내용 많으면 가로 스크롤
          py={2} // 상하 패딩
          px={1} // 좌우 패딩
          gap={3} // 주사위 간 간격
          // 주사위 개수에 따라 정렬 방식 변경
          justifyContent={dices.length > 0 ? "flex-start" : "center"}
          minHeight="85px" // 최소 높이 지정 (주사위 컴포넌트 높이 고려)
          alignItems="flex-start" // 주사위 컴포넌트 상단 정렬
        >
          {dices.length > 0 ? (
            // 현재 주사위 목록 렌더링
            dices.map((dice, i) => (
              <Dice
                // key는 안정적인 식별자를 사용하는 것이 좋으나, 여기서는 index 사용
                key={i}
                defaultValue={dice.value}
                max={dice.max}
                colorScheme={dice.color}
                onChange={(newValue) => {
                  // 값이 변경되면 onDiceChange 핸들러 호출
                  onDiceChange(i, newValue)
                }}
              />
            ))
          ) : (
            // 주사위가 없을 때 안내 메시지
            <Center flex={1} h="full">
              {" "}
              {/* Center 컴포넌트로 감싸서 수직 중앙 정렬 */}
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
// --- 주사위 위젯 컴포넌트 끝 ---
