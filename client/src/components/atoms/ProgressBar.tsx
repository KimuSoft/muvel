import React from "react"
import { Box, useColorModeValue } from "@chakra-ui/react"

const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
  return (
    <Box
      w="100%"
      h="6px"
      borderRadius={5}
      overflow="hidden"
      bgColor={useColorModeValue("gray.300", "gray.600")}
    >
      <Box
        w={`${value * 100}%`}
        h="100%"
        borderRadius={5}
        transition={"width 0.2s ease-in-out"}
        bgColor={useColorModeValue("gray.500", "gray.400")}
      />
    </Box>
  )
}

export default ProgressBar
