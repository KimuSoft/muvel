import { Box, type BoxProps, Flex, type FlexProps } from "@chakra-ui/react"
import React from "react"
import "./block.css"

export const DividerContainer: React.FC<FlexProps> = (props) => (
  <Flex justify="center" align="center" w="100%" {...props} />
)

export const Divider: React.FC<BoxProps> = (props) => (
  <Box w="60%" h="1px" bg="#52525b" mt="80px" mb="100px" {...props} />
)

export const BlockContainer: React.FC<BoxProps> = (props) => (
  <Box
    className="block-container"
    listStyleType="none"
    p={0}
    m={0}
    {...props}
  />
)
