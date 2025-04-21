import { Box, type BoxProps, Flex, Text } from "@chakra-ui/react"
import React, { forwardRef, type ReactNode } from "react"

export const WidgetBase: React.FC<BoxProps> = (props) => {
  return (
    <Box
      borderRadius={5}
      bgColor={{ base: "white", _dark: "black" }}
      boxShadow="sm"
      overflow="hidden"
      width="full"
      {...props}
    />
  )
}

export const WidgetHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  return (
    <Flex
      ref={ref}
      px={3}
      py={1.5}
      h={"34px"}
      align="center"
      cursor="pointer"
      color={{ base: "gray.500", _dark: "gray.300" }}
      gap={2}
      borderBottom="1px solid"
      borderColor={{ base: "gray.100", _dark: "gray.900" }}
      {...props}
    />
  )
})

export const WidgetTitle = ({ children }: { children: ReactNode }) => {
  return (
    <Text fontSize="sm" truncate>
      {children}
    </Text>
  )
}

export const WidgetBody = ({ children, ...props }: BoxProps) => {
  return (
    <Box px={3} py={2} {...props}>
      {children}
    </Box>
  )
}
