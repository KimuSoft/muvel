import React, { useEffect, useMemo, useState } from "react"
import {
  HStack,
  IconButton,
  Menu,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import confetti from "canvas-confetti"
import {
  WidgetBase,
  WidgetBody,
  WidgetHeader,
  WidgetTitle,
} from "~/features/novel-editor/widgets/components/WidgetBase"
import { useEditorContext } from "~/features/novel-editor/context/EditorContext"
import { IoSettings } from "react-icons/io5"
import { GoNumber } from "react-icons/go"
import {
  countTextLength,
  CountType,
} from "~/features/legacy-editor/utils/measureText"
import ProgressBar from "~/features/legacy-editor/components/atoms/ProgressBar"
import type { WidgetBaseProps } from "~/features/novel-editor/widgets/components/widgetMap"

export const CharCountWidget: React.FC<WidgetBaseProps> = ({
  dragAttributes,
  dragListeners,
}) => {
  const { view } = useEditorContext()
  const [type, setType] = useState(CountType.NoSpacing)
  const [percentage, setPercentage] = useState(0)
  const [currentLength, setCurrentLength] = useState(0)

  const getGoal = () => [5000, 3000, 14][type]
  const unitLabel = ["자", "자", "KB"]
  const labelText = ["공백 포함", "공백 제외", "KB"]

  const getCurrentLength = () => {
    if (!view) return 0
    return countTextLength(view.state.doc, type)
  }

  useEffect(() => {
    const len = getCurrentLength()
    setCurrentLength(len)

    const _percent = (len * 100) / getGoal()
    setPercentage(_percent)

    if (_percent !== 100) return
    const duration = 10 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)

      const particleCount = 50 * (timeLeft / duration)
      void confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        }),
      )
      void confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        }),
      )
    }, 250)
  }, [view?.state.doc, type])

  const cheeringText = useMemo(() => {
    if (percentage < 20) return "열심히 써봐요!"
    if (percentage < 40) return "조금만 더 써봐요!"
    if (percentage < 60) return "좋아요!"
    if (percentage < 80) return "잘하고 있어요!"
    if (percentage < 100) return "앞으로 조금만 더!"
    if (percentage < 120) return "다 채웠어요!"
    return "🎉"
  }, [percentage])

  const getSelectedProps = (menuType: CountType) =>
    menuType === type
      ? {
          color: { base: "purple.500", _dark: "purple.300" },
          disabled: true,
          cursor: "default",
        }
      : {}

  return (
    <WidgetBase>
      <WidgetHeader {...dragAttributes} {...dragListeners}>
        <GoNumber />
        <WidgetTitle>글자 수 세기 ({labelText[type]})</WidgetTitle>
        <Spacer />
        <MenuRoot>
          <MenuTrigger asChild>
            <IconButton
              size="xs"
              variant={"ghost"}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <IoSettings size={9} />
            </IconButton>
          </MenuTrigger>
          <MenuPositioner>
            <MenuContent>
              <MenuItem
                value={"문피아"}
                onClick={() => setType(CountType.NoSpacing)}
                {...getSelectedProps(CountType.NoSpacing)}
              >
                공백 제외 3,000자
                <Menu.ItemCommand>노벨피아</Menu.ItemCommand>
              </MenuItem>
              <MenuItem
                value={"노벨피아"}
                onClick={() => setType(CountType.All)}
                {...getSelectedProps(CountType.All)}
              >
                공백 포함 5,000자
                <Menu.ItemCommand>문피아</Menu.ItemCommand>
              </MenuItem>
              <MenuItem
                value={"조아라"}
                onClick={() => setType(CountType.KB)}
                {...getSelectedProps(CountType.KB)}
              >
                14KB
                <Menu.ItemCommand>조아라</Menu.ItemCommand>
              </MenuItem>
            </MenuContent>
          </MenuPositioner>
        </MenuRoot>
      </WidgetHeader>
      <WidgetBody pt={2} pb={3}>
        <HStack w="100%" mb={1}>
          <VStack align="baseline" gap={0}>
            <Text fontSize="sm">
              {currentLength.toLocaleString()}
              {unitLabel[type]} / {getGoal().toLocaleString()}
              {unitLabel[type]}
            </Text>
          </VStack>
          <Spacer />
          <Text fontSize={"lg"} fontWeight={"bold"}>
            {Math.floor(percentage)}%
          </Text>
        </HStack>
        <ProgressBar value={percentage / 100} />
        {/*<Text mt={1} fontSize="xs">*/}
        {/*  {cheeringText}*/}
        {/*</Text>*/}
      </WidgetBody>
    </WidgetBase>
  )
}
