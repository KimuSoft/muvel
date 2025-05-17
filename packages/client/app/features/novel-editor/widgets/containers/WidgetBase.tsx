import { Box, type BoxProps, Flex, Text } from "@chakra-ui/react"
import React, { forwardRef, type ReactNode } from "react"
import { useEditorStyleOptions } from "~/hooks/useAppOptions"

export const WidgetBase: React.FC<BoxProps> = (props) => {
  const [editorStyle] = useEditorStyleOptions()

  return (
    <Box
      borderRadius={5}
      bgColor={editorStyle.backgroundColor || { base: "white", _dark: "black" }}
      color={editorStyle.color || undefined}
      boxShadow="md"
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
  const [editorStyle] = useEditorStyleOptions()

  return (
    <Flex
      ref={ref}
      px={3}
      py={1.5}
      h={"34px"}
      align="center"
      cursor="pointer"
      color={editorStyle.color || { base: "gray.500", _dark: "gray.400" }}
      gap={2}
      borderBottom="1px solid"
      borderColor={editorStyle.color || { base: "gray.100", _dark: "gray.900" }}
      userSelect="none"
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
