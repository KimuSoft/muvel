import React, { PropsWithChildren } from "react"
import { HStack, useColorModeValue, VStack } from "@chakra-ui/react"

export const Widget: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <VStack
      w="100%"
      bgColor={useColorModeValue("gray.100", "gray.800")}
      gap={0}
      borderRadius={5}
      overflow={"hidden"}
      shadow={"lg"}
    >
      {children}
    </VStack>
  )
}

export const WidgetHeader: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <HStack
      w="100%"
      px={5}
      py={1}
      bgColor={useColorModeValue("gray.50", "gray.700")}
      fontSize={"xs"}
      userSelect={"none"}
    >
      {children}
    </HStack>
  )
}

export const WidgetBody: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <VStack px={7} py={5} w="100%">
      {children}
    </VStack>
  )
}
