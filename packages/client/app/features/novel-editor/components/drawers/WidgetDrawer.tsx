import {
  CloseButton,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerRootProvider,
  DrawerTitle,
  DrawerTrigger,
  IconButton,
  SimpleGrid,
  type StackProps,
  Text,
  type UseDialogReturn,
  VStack,
} from "@chakra-ui/react"
import React from "react"
import { useWidgetLayout } from "~/features/novel-editor/widgets/context/WidgetContext"
import {
  type WidgetButtonProps,
  type WidgetId,
  widgets,
} from "~/features/novel-editor/widgets/components/widgetMap"
import { Tooltip } from "~/components/ui/tooltip"
import { MdOutlineWidgets } from "react-icons/md"

const WidgetButton: React.FC<
  StackProps & WidgetButtonProps & { isActive: boolean }
> = ({ id, name, description, icon, isActive, ...props }) => {
  return (
    <Tooltip content={description} showArrow openDelay={100}>
      <VStack
        color={isActive ? "purple.500" : undefined}
        userSelect="none"
        cursor="pointer"
        {...props}
      >
        <IconButton
          size={"xl"}
          variant={isActive ? "solid" : "outline"}
          colorPalette={isActive ? "purple" : "gray"}
        >
          {icon}
        </IconButton>
        <Text fontWeight={isActive ? 500 : undefined}>{name}</Text>
      </VStack>
    </Tooltip>
  )
}

const WidgetDrawer: React.FC<{
  children?: React.ReactNode
  dialog: UseDialogReturn
}> = ({ children, dialog }) => {
  const { layout, toggleWidget } = useWidgetLayout()

  const isActive = (id: WidgetId) => {
    return layout.left.includes(id) || layout.right.includes(id)
  }

  return (
    <DrawerRootProvider value={dialog} size={"sm"}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent>
          <DrawerCloseTrigger asChild>
            <CloseButton position="absolute" top="4" right="4" />
          </DrawerCloseTrigger>
          <DrawerHeader>
            <MdOutlineWidgets size={26} />
            <DrawerTitle ml={2}>위젯 설정하기</DrawerTitle>
          </DrawerHeader>

          <DrawerBody>
            <SimpleGrid mt={3} minChildWidth={"80px"} gap={5}>
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
    </DrawerRootProvider>
  )
}

export default WidgetDrawer
