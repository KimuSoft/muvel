import React from "react"
import { Tag, type TagRootProps } from "@chakra-ui/react"

const TagChip: React.FC<TagRootProps> = (props) => {
  return (
    <Tag.Root size={"sm"} colorPalette={"purple"} variant={"solid"} {...props}>
      <Tag.Label />
    </Tag.Root>
  )
}

export default TagChip
