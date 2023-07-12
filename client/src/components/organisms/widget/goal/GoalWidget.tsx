import styled from "styled-components"
import React, { useContext, useEffect, useState } from "react"
import ProgressBar from "../../../atoms/ProgressBar"
import EditorContext from "../../../../context/EditorContext"
import {
  useColorModeValue,
  VStack,
  Text,
  Heading,
  HStack,
  Spacer,
  IconButton,
} from "@chakra-ui/react"
import { FaExchangeAlt } from "react-icons/fa"
import blocksToText from "../../../../utils/blocksToText"
import confetti from "canvas-confetti"
import { blocksState } from "../../../../recoil/editor"
import { useRecoilState } from "recoil"

const GoalPercent = styled.h3`
  margin: 0 0;
  font-size: 24px;
  font-weight: 700;
  text-align: right;

  width: 70px;
`

const GoalWidget: React.FC = () => {
  const [blocks] = useRecoilState(blocksState)
  const [type, setType] = useState<CountType>(CountType.NoSpacing)
  const [percentage, setPercentage] = useState(0)

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

  const getCurrentLength = () => {
    switch (type) {
      case CountType.NoSpacing:
        return blocks.reduce(
          (acc, cur) => acc + cur.content.replace(/\s/g, "").length,
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

  const changeType = () => {
    switch (type) {
      case CountType.NoSpacing:
        setType(CountType.All)
        break
      case CountType.All:
        setType(CountType.KB)
        break
      case CountType.KB:
        setType(CountType.NoSpacing)
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
  })

  const countTypeText = ["공백 포함", "공백 제외", ""]
  const countTypeUnit = ["자", "자", "KB"]

  const getCheeringText = () => {
    if (percentage < 20) return "열심히 써봐요!"
    if (percentage < 40) return "조금만 더 써봐요!"
    if (percentage < 60) return "좋아요!"
    if (percentage < 80) return "잘하고 있어요!"
    if (percentage < 100) return "앞으로 조금만 더!"
    if (percentage < 120) return "다 채웠어요!"
  }

  return (
    <VStack
      bgColor={useColorModeValue("gray.200", "gray.700")}
      p={25}
      gap={2}
      w={300}
      borderRadius={10}
    >
      <HStack w="100%">
        <VStack align="baseline" gap={0}>
          <Text>{countTypeText[type]}</Text>
          <Heading fontSize="xl">
            {getCurrentLength().toLocaleString()}
            {countTypeUnit[type]} / {getGoal().toLocaleString()}
            {countTypeUnit[type]}
          </Heading>
        </VStack>
        <Spacer />
        <GoalPercent>{Math.floor(percentage)}%</GoalPercent>
      </HStack>
      <ProgressBar value={percentage / 100} />
      <Text fontSize="sm">{getCheeringText()}</Text>
      <IconButton
        size="sm"
        aria-label="change"
        position="absolute"
        right="60px"
        bottom="40px"
        icon={<FaExchangeAlt />}
        onClick={changeType}
      />
    </VStack>
  )
}

enum CountType {
  All,
  NoSpacing,
  KB,
}

export default GoalWidget
