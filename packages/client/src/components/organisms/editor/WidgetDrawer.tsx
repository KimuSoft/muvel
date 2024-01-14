import React, { useEffect, useState } from "react"
import {
  Button,
  Card,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  HStack,
  IconButton,
  Text,
  theme,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { BiSolidWidget } from "react-icons/bi"
import { DrawerBody } from "@chakra-ui/react"
import { IWidget, widgetData } from "../widget"
import { useRecoilState } from "recoil"
import { widgetsState } from "../../../recoil/editor"

const WidgetItem: React.FC<{ widget: IWidget }> = ({ widget }) => {
  const [widgets, setWidgets] = useRecoilState(widgetsState)
  const [checked, setChecked] = useState(widgets.has(widget.id))

  useEffect(() => {
    setChecked(widgets.has(widget.id))
  }, [widgets])

  const toggle = () => {
    const checked_ = !checked

    if (checked_) {
      widgets.add(widget.id)
      setWidgets(new Set(Array.from(widgets)))
    } else {
      widgets.delete(widget.id)
      setWidgets(new Set(Array.from(widgets)))
    }

    setChecked(checked_)
  }

  const checkedColor = useColorModeValue(
    theme.colors.purple["600"],
    theme.colors.purple["300"]
  )

  return (
    <Card
      w="100%"
      px={7}
      py={4}
      bgColor={useColorModeValue("gray.200", "gray.600")}
      _hover={{
        bgColor: useColorModeValue("gray.300", "gray.500"),
      }}
      transition={"background-color ease 0.2s"}
      onClick={toggle}
      cursor={"pointer"}
      userSelect={"none"}
    >
      <HStack gap={5}>
        <widget.icon
          size={24}
          color={checked ? checkedColor : undefined}
          style={{ transition: "color ease 0.2s", flexShrink: 0 }}
        />
        <VStack align={"baseline"} gap={1}>
          <Heading
            fontSize={"xl"}
            color={checked ? checkedColor : undefined}
            transition={"color ease 0.2"}
          >
            {widget.name}
          </Heading>
          <Text>{widget.description}</Text>
        </VStack>
      </HStack>
    </Card>
  )
}

const WidgetDrawer: React.FC = () => {
  const [_widgets, setWidgets] = useRecoilState(widgetsState)
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <IconButton
        aria-label={"widget"}
        icon={<BiSolidWidget />}
        onClick={onOpen}
        variant={"ghost"}
        size={"sm"}
      />

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <HStack gap={3}>
              <BiSolidWidget size={24} />
              <Heading fontSize="xl">위젯 관리하기</Heading>
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <VStack w="100%">
              {widgetData.map((widget) => (
                <WidgetItem key={widget.id + "-on-drawer"} widget={widget} />
              ))}
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Button onClick={() => setWidgets(new Set())}>
              위젯 설정 초기화
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default WidgetDrawer
