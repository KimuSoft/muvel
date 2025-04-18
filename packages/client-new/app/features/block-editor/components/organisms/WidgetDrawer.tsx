import React, { useEffect, useState } from "react"
import {
  Button,
  Card,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  HStack,
  IconButton,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { BiSolidWidget } from "react-icons/bi"
import { type IWidget, widgetData } from "../widget"
import { useBlockEditor } from "~/features/block-editor/context/EditorContext"

const WidgetItem: React.FC<{ widget: IWidget }> = ({ widget }) => {
  const { widgets, updateWidgets } = useBlockEditor()
  const [checked, setChecked] = useState(widgets.has(widget.id))

  useEffect(() => {
    setChecked(widgets.has(widget.id))
  }, [widgets])

  const toggle = () => {
    const checked_ = !checked

    if (checked_) {
      widgets.add(widget.id)
      updateWidgets(() => new Set(Array.from(widgets)))
    } else {
      widgets.delete(widget.id)
      updateWidgets(() => new Set(Array.from(widgets)))
    }

    setChecked(checked_)
  }

  return (
    <Card.Root
      w="100%"
      px={7}
      py={4}
      bgColor={{ base: "gray.200", _dark: "gray.600" }}
      _hover={{ bgColor: { base: "gray.300", _dark: "gray.500" } }}
      transition={"background-color ease 0.2s"}
      onClick={toggle}
      cursor={"pointer"}
      userSelect={"none"}
    >
      <HStack gap={5}>
        <widget.icon
          size={24}
          color={
            checked ? { base: "purple.600", _dark: "purple.300" } : undefined
          }
          style={{ transition: "color ease 0.2s", flexShrink: 0 }}
        />
        <VStack align={"baseline"} gap={1}>
          <Heading
            fontSize={"xl"}
            color={
              checked ? { base: "purple.600", _dark: "purple.300" } : undefined
            }
            transition={"color ease 0.2"}
          >
            {widget.name}
          </Heading>
          <Text>{widget.description}</Text>
        </VStack>
      </HStack>
    </Card.Root>
  )
}

const WidgetDrawer: React.FC = () => {
  const { updateWidgets } = useBlockEditor()
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <IconButton
        aria-label={"widget"}
        onClick={onOpen}
        variant={"ghost"}
        size={"sm"}
      >
        <BiSolidWidget />
      </IconButton>

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
            <Button onClick={() => updateWidgets(() => new Set())}>
              위젯 설정 초기화
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default WidgetDrawer
