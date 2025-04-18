import React, { useEffect, useState } from "react"
import {
  Button,
  Card,
  Drawer,
  Heading,
  HStack,
  IconButton,
  Text,
  VStack,
  Portal,
  CloseButton,
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
    } else {
      widgets.delete(widget.id)
    }

    updateWidgets(() => new Set(Array.from(widgets)))
    setChecked(checked_)
  }

  return (
    <Card.Root
      w="100%"
      px={7}
      py={4}
      bgColor={{ base: "gray.200", _dark: "gray.600" }}
      _hover={{ bgColor: { base: "gray.300", _dark: "gray.500" } }}
      transition="background-color ease 0.2s"
      onClick={toggle}
      cursor="pointer"
      userSelect="none"
    >
      <HStack gap={5}>
        <widget.icon
          size={24}
          style={{
            color: checked ? "var(--chakra-colors-purple-600)" : undefined,
            transition: "color ease 0.2s",
            flexShrink: 0,
          }}
        />
        <VStack align="start" gap={1}>
          <Heading
            fontSize="xl"
            color={checked ? "purple.600" : undefined}
            transition="color ease 0.2s"
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
  const [open, setOpen] = useState(false)

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      placement="end"
    >
      <Drawer.Trigger asChild>
        <IconButton aria-label="widget" variant="ghost" size="sm">
          <BiSolidWidget />
        </IconButton>
      </Drawer.Trigger>

      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content w="sm">
            <Drawer.Header>
              <HStack gap={3}>
                <BiSolidWidget size={24} />
                <Heading fontSize="xl">위젯 관리하기</Heading>
                <Drawer.CloseTrigger asChild>
                  <CloseButton position="absolute" right="3" top="3" />
                </Drawer.CloseTrigger>
              </HStack>
            </Drawer.Header>

            <Drawer.Body>
              <VStack w="100%">
                {widgetData.map((widget) => (
                  <WidgetItem key={widget.id + "-on-drawer"} widget={widget} />
                ))}
              </VStack>
            </Drawer.Body>

            <Drawer.Footer>
              <Button onClick={() => updateWidgets(() => new Set())}>
                위젯 설정 초기화
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}

export default WidgetDrawer
