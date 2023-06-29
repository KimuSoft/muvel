import styled from "styled-components"
import React, { useContext, useState } from "react"
import ProgressBar from "../../../atoms/ProgressBar"
import EditorContext from "../../../../context/EditorContext"
import {
  Box,
  useColorModeValue,
  VStack,
  Text,
  Heading,
  HStack,
  Spacer,
  Button,
  IconButton,
} from "@chakra-ui/react"
import { FaExchangeAlt } from "react-icons/fa"
import blocksToText from "../../../../utils/blocksToText"

const WidgetBlock = styled.div`
  display: flex;
  flex-direction: column;

  padding: 30px;
  gap: 5px;

  width: 100%;
  height: 130px;

  background-color: #3f3f46;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
`

const CheeringText = styled.h4`
  margin: 0 0;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
`

const GoalTextBlock = styled.div`
  display: flex;
  flex-direction: row;

  margin: 0 0;
  padding: 0;
  height: 30px;
  width: 100%;
`

const GoalText = styled.h3`
  margin: 0 0;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;

  width: calc(100% - 70px);
`

const GoalPercent = styled.h3`
  margin: 0 0;
  font-size: 24px;
  font-weight: 700;
  text-align: right;

  width: 70px;
`

const GoalWidget: React.FC = () => {
  const { blocks } = useContext(EditorContext)
  const [type, setType] = useState<CountType>(CountType.NoSpacing)

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
  const getPercentage = () => Math.floor((getCurrentLength() * 100) / getGoal())

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

  const countTypeText = ["공백 포함", "공백 제외", ""]
  const countTypeUnit = ["자", "자", "KB"]

  const getCheeringText = () => {
    const p = getPercentage()
    if (p < 20) return "열심히 써봐요!"
    if (p < 40) return "조금만 더 써봐요!"
    if (p < 60) return "좋아요!"
    if (p < 80) return "잘하고 있어요!"
    if (p < 100) return "앞으로 조금만 더!"
    if (p < 120) return "다 채웠어요!"
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
        <GoalPercent>{getPercentage()}%</GoalPercent>
      </HStack>
      <ProgressBar value={getPercentage() / 100} />
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
