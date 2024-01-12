import React, { useEffect, useMemo, useState } from "react"
import ProgressBar from "../../atoms/ProgressBar"
import {
  VStack,
  Text,
  Heading,
  HStack,
  Spacer,
  MenuList,
  MenuItem,
  Menu,
  MenuButton,
  IconButton,
} from "@chakra-ui/react"
import blocksToText from "../../../utils/blocksToText"
import confetti from "canvas-confetti"
import { blocksState } from "../../../recoil/editor"
import { useRecoilState } from "recoil"
import { ImCalculator } from "react-icons/im"
import { Widget, WidgetBody, WidgetHeader } from "./Widget"
import { IoSettings } from "react-icons/io5"

const GoalWidget: React.FC = () => {
  const [blocks] = useRecoilState(blocksState)
  const [type, setType] = useState<CountType>(CountType.NoSpacing)
  const [percentage, setPercentage] = useState(0)
  const [currentLength, setCurrentLength] = useState(0)

  const getGoal = () => [5000, 3000, 14][type]

  const getByte = (content: string) => {
    let totalByte = 0
    for (let i = 0; i < content.length; i++) {
      const currentByte = content.charCodeAt(i)
      if (currentByte > 128) {
        totalByte += 2
      } else {
        totalByte++
      }
    }
    return totalByte
  }

  useEffect(() => {
    setCurrentLength(getCurrentLength())
  }, [blocks])

  const getCurrentLength = () => {
    switch (type) {
      case CountType.NoSpacing:
        return blocks.reduce(
          (acc, cur) => acc + (cur.content || "").replace(/\s/g, "").length,
          0
        )

      case CountType.All:
        return blocksToText(blocks).length

      case CountType.KB:
        return (
          Math.floor((getByte(blocksToText(blocks)) / 1024) * 100 * 1.439) / 100
        )
    }
  }

  useEffect(() => {
    const _percentage = (getCurrentLength() * 100) / getGoal()
    setPercentage(_percentage)

    if (_percentage !== 100) return
    const duration = 10 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    // @ts-ignore
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      // since particles fall down, start a bit higher than random
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
      )?.then()
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      )?.then()
    }, 250)
  }, [percentage])

  const countTypeText = ["공백 포함", "공백 제외", "KB"]
  const countTypeUnit = ["자", "자", "KB"]

  const cheeringText = useMemo(() => {
    if (percentage < 20) return "열심히 써봐요!"
    if (percentage < 40) return "조금만 더 써봐요!"
    if (percentage < 60) return "좋아요!"
    if (percentage < 80) return "잘하고 있어요!"
    if (percentage < 100) return "앞으로 조금만 더!"
    if (percentage < 120) return "다 채웠어요!"
  }, [percentage])

  const getSelectedProps = (menuCountType: CountType) =>
    menuCountType === type
      ? {
          color: "purple.200",
          disabled: true,
          cursor: "default",
        }
      : {}

  return (
    <Widget>
      <WidgetHeader>
        <ImCalculator size={12} />
        <Text>글자 수 세기 ({countTypeText[type]})</Text>
        <Spacer />
        <Menu>
          <MenuButton
            size="xs"
            as={IconButton}
            icon={<IoSettings size={9} />}
          />
          <MenuList>
            <MenuItem
              command={"노벨피아"}
              onClick={() => setType(CountType.NoSpacing)}
              {...getSelectedProps(CountType.NoSpacing)}
            >
              공백 제외 3,000자
            </MenuItem>
            <MenuItem
              command={"문피아"}
              onClick={() => setType(CountType.All)}
              {...getSelectedProps(CountType.All)}
            >
              공백 포함 5,000자
            </MenuItem>
            <MenuItem
              command={"조아라"}
              onClick={() => setType(CountType.KB)}
              {...getSelectedProps(CountType.KB)}
            >
              14KB
            </MenuItem>
          </MenuList>
        </Menu>
      </WidgetHeader>
      <WidgetBody>
        <HStack w="100%" px={1}>
          <VStack align="baseline" gap={0}>
            <Text fontSize="md">
              {currentLength.toLocaleString()}
              {countTypeUnit[type]} / {getGoal().toLocaleString()}
              {countTypeUnit[type]}
            </Text>
          </VStack>
          <Spacer />
          <Heading fontSize={"xl"}>{Math.floor(percentage)}%</Heading>
        </HStack>
        <ProgressBar value={percentage / 100} />
        <Text fontSize="xs">{cheeringText}</Text>
      </WidgetBody>
    </Widget>
  )
}

enum CountType {
  All,
  NoSpacing,
  KB,
}

export default GoalWidget
