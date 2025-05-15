import React from "react"
import { Box } from "@chakra-ui/react"

const ProgressBar: React.FC<{
  value: number
  min?: number
  max?: number
  colorPalette?: string
}> = ({ value, min = 0, max = 1, colorPalette = "gray" }) => {
  return (
    <Box
      w="100%"
      h="6px"
      borderRadius={5}
      overflow="hidden"
      bgColor={{ base: `gray.300`, _dark: `gray.600` }}
    >
      <Box
        w={`${(value / (max - min)) * 100}%`}
        h="100%"
        borderRadius={5}
        transition={"width 0.2s ease-in-out, background-color 0.2s ease-in-out"}
        bgColor={{ base: `${colorPalette}.500`, _dark: `${colorPalette}.400` }}
      />
    </Box>
  )
}

export default ProgressBar
