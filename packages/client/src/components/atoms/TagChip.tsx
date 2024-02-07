import React from "react"
import { Box, BoxProps, Tag } from "@chakra-ui/react"

const TagChip: React.FC<BoxProps> = (props) => {
  return (
    <Tag size={"sm"} bgColor={"purple.500"} borderRadius={"full"} {...props} />
  )
}

export default TagChip
