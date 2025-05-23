import React, { forwardRef } from "react"
import { Box, Heading, HStack, Text, VStack } from "@chakra-ui/react"
import type { Novel } from "muvel-api-types"
import TagChip from "~/components/atoms/TagChip"
import { useNavigate } from "react-router"

const SimpleNovelItem = forwardRef<HTMLDivElement, { novel: Novel }>(
  ({ novel, ...props }, ref) => {
    const navigate = useNavigate()

    return (
      <VStack
        w="150px"
        rounded={5}
        cursor={"pointer"}
        onClick={() => navigate(`/novels/${novel.id}`)}
        userSelect={"none"}
        alignItems="flex-start"
        ref={ref}
        {...props}
      >
        <Box
          w={"100%"}
          minW="150px"
          h="225px"
          borderRadius={"md"}
          backgroundColor={{ base: "gray.200", _dark: "gray.700" }}
          backgroundImage={novel.thumbnail || ""}
          backgroundRepeat={"no-repeat"}
          backgroundSize={"cover"}
          backgroundPosition={"center"}
          flexShrink={0}
          overflow={"none"}
          borderWidth={1}
          borderColor={"transparent"}
          transition={"border-color 0.2s"}
          _hover={{ borderColor: { base: "gray.100", _dark: "purple.500" } }}
        />
        <HStack w={"100%"}>
          <Heading size={"md"}>{novel.title}</Heading>
          <Text fontSize={"xs"} color={"gray.500"} flexShrink={0}>
            {novel.author?.username || "로컬 소설"}
          </Text>
        </HStack>

        <HStack w={"100%"} flexWrap={"wrap"} gap={1}>
          {novel.tags.map((tag, idx) => (
            <TagChip key={idx}>{tag}</TagChip>
          ))}
        </HStack>
      </VStack>
    )
  },
)

export default SimpleNovelItem
