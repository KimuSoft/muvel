import React from "react"
import { type Character } from "muvel-api-types"
import { Avatar, Float, Tag, Text, VStack } from "@chakra-ui/react"

const CharacterItem: React.FC<{ character: Character }> = ({ character }) => {
  return (
    <VStack>
      <Avatar.Root>
        <Float placement="bottom-end" offsetX="1" offsetY="1">
          <Tag.Root size={"sm"}>
            <Tag.Label>주연</Tag.Label>
          </Tag.Root>
        </Float>
      </Avatar.Root>
      <Text truncate>{character.name}</Text>
    </VStack>
  )
}

export default CharacterItem
