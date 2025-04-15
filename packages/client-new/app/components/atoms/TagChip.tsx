import React from "react"
import { Box, type BoxProps, Tag } from "@chakra-ui/react"

const TagChip: React.FC<BoxProps> = (props) => {
  return (
    <Tag.Root
      size={"sm"}
      bgColor={"purple.500"}
      color={"white"}
      borderRadius={"full"}
    >
      <Tag.Label {...props} />
    </Tag.Root>
  )
}

export default TagChip
