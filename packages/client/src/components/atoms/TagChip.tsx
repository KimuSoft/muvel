import React from "react"
import { Box, BoxProps } from "@chakra-ui/react"

const TagChip: React.FC<BoxProps> = (props) => {
  return (
    <Box
      px={"7px"}
      py={"3px"}
      backgroundColor={"purple.500"}
      color={"white"}
      borderRadius={"14px"}
      {...props}
      fontSize={"xs"}
    />
  )
}

export default TagChip
