import {
  CloseButton,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  type StackProps,
  Text,
} from "@chakra-ui/react"
import React, { type PropsWithChildren } from "react"
import { useWidgetLayout } from "~/features/editor/widgets/context/WidgetLayoutContext"
import { GoNumber } from "react-icons/go"
import type { WidgetId } from "~/features/editor/widgets/components/widgetMap"
import { RiCharacterRecognitionFill } from "react-icons/ri"
import { FaBookBookmark, FaDiceSix } from "react-icons/fa6"
import { BiNotepad } from "react-icons/bi"
import { IoSpeedometerOutline } from "react-icons/io5"
import { MdOutlineTimer } from "react-icons/md"

interface WidgetButtonProps {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

const widgets: WidgetButtonProps[] = [
  {
    id: "charCount",
    name: "글자 수 세기",
    description:
      "실시간으로 여러 기준에 따라 글자 수를 계산하고, 목표를 설정할 수 있는 위젯입니다.",
    icon: <GoNumber size={64} />,
  },
  {
    id: "symbol",
    name: "특수문자 입력기",
    description:
      "소설에서 사용하는 다양한 특수문자를 쉽게 입력할 수 있습니다. 원하는 문자를 추가할 수도 있습니다.",
    icon: <RiCharacterRecognitionFill size={64} />,
  },
  {
    id: "dict",
    name: "사전 검색",
    description: "단어를 빠르게 검색하고 찾을 수 있습니다.",
    icon: <FaBookBookmark size={42} />,
  },
  {
    id: "timer",
    name: "타이머/스톱워치 위젯",
    description: "글을 쓰는 시간을 측정할 수 있는 위젯입니다.",
    icon: <MdOutlineTimer size={50} />,
  },
  {
    id: "speed",
    name: "속도계 위젯",
    description:
      "실시간 글 집필 속도와 예상 소요 시간을 계산해주는 위젯입니다.",
    icon: <IoSpeedometerOutline size={50} />,
  },
  {
    id: "memo",
    name: "메모장 위젯",
    description: "소설을 쓰면서 필요한 메모를 작성할 수 있는 위젯입니다.",
    icon: <BiNotepad size={50} />,
  },
  {
    id: "dice",
    name: "주사위 위젯",
    description:
      "내 소설 전개를 하늘에 맡기고 싶은 무책임한 작가를 위한 위젯입니다.",
    icon: <FaDiceSix size={50} />,
  },
]

const WidgetButton: React.FC<
  StackProps & WidgetButtonProps & { isActive: boolean }
> = ({ id, name, description, icon, isActive, ...props }) => {
  return (
    <HStack
      px={3}
      py={3}
      borderRadius={3}
      borderColor={isActive ? "purple.500" : "gray.500"}
      borderWidth={1}
      color={isActive ? "purple.500" : undefined}
      userSelect="none"
      _hover={{
        bgColor: { base: "gray.50", _dark: "gray.900" },
      }}
      cursor="pointer"
      {...props}
    >
      <Icon w={"64px"} flexShrink={0}>
        {icon}
      </Icon>
      <Stack gap={1}>
        <Text fontWeight={600}>{name}</Text>
        <Text fontSize={"sm"} color={"gray.500"}>
          {description}
        </Text>
      </Stack>
    </HStack>
  )
}

const WidgetDrawer: React.FC<PropsWithChildren> = ({ children }) => {
  const { layout, toggleWidget } = useWidgetLayout()

  const isActive = (id: WidgetId) => {
    return layout.left.includes(id) || layout.right.includes(id)
  }

  return (
    <DrawerRoot size={"md"}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent>
          <DrawerCloseTrigger asChild>
            <CloseButton position="absolute" top="4" right="4" />
          </DrawerCloseTrigger>
          <DrawerHeader>
            <DrawerTitle>위젯 설정하기</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <SimpleGrid columns={1} gap={2}>
              {widgets.map((widget) => (
                <WidgetButton
                  key={widget.id}
                  id={widget.id}
                  name={widget.name}
                  description={widget.description}
                  icon={widget.icon}
                  isActive={isActive(widget.id as WidgetId)}
                  onClick={() => toggleWidget(widget.id as WidgetId)}
                />
              ))}
            </SimpleGrid>
          </DrawerBody>

          <DrawerFooter justifyContent="space-between"></DrawerFooter>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  )
}

export default WidgetDrawer
