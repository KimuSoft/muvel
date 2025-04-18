import React from "react"
import { Box, Heading, HStack, Text, VStack } from "@chakra-ui/react"
import { useBlockEditor } from "~/features/block-editor/context/EditorContext"

const NovelProfile: React.FC = () => {
  const { novel } = useBlockEditor()

  return (
    <HStack gap={5}>
      <Box
        borderRadius="5px"
        w="100px"
        h="140px"
        flexShrink={0}
        bgColor="gray.500"
        backgroundImage={novel.thumbnail || ""}
        backgroundRepeat={"no-repeat"}
        backgroundSize={"cover"}
        backgroundPosition={"center"}
      />
      <VStack w="100%" h="130px" align="baseline">
        <Heading size="md">{novel.title}</Heading>
        <Text textIndent="0.5em" h="110px">
          {novel.description}
        </Text>
      </VStack>
    </HStack>
  )
}

export default NovelProfile
