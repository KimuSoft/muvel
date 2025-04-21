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
  SimpleGrid,
} from "@chakra-ui/react"
import React, { type PropsWithChildren } from "react"

const WidgetDrawer: React.FC<PropsWithChildren> = ({ children }) => {
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
            <SimpleGrid columns={2}></SimpleGrid>
          </DrawerBody>

          <DrawerFooter justifyContent="space-between"></DrawerFooter>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  )
}

export default WidgetDrawer
