import React, { forwardRef } from "react"
import {
  Box,
  Heading,
  HStack,
  type StackProps,
  Text,
  VStack,
} from "@chakra-ui/react"
import type { Novel } from "../../../types/novel.type"
import TagChip from "~/components/atoms/TagChip"
import { useNavigate } from "react-router"

const NovelItem = forwardRef<HTMLDivElement, { novel: Novel }>(
  ({ novel, ...props }, ref) => {
    const navigate = useNavigate()

    return (
      <HStack
        px={2}
        py={2}
        rounded={5}
        gap={5}
        cursor={"pointer"}
        transition={"background-color 0.2s ease-in-out"}
        onClick={() => navigate(`/novels/${novel.id}`)}
        userSelect={"none"}
        _hover={{ bgColor: { base: "gray.100", _dark: "gray.900" } }}
        ref={ref}
        {...props}
      >
        <Box
          w="100px"
          h="150px"
          borderRadius="5px"
          backgroundColor={{ base: "gray.200", _dark: "gray.700" }}
          backgroundImage={novel.thumbnail || ""}
          backgroundRepeat={"no-repeat"}
          backgroundSize={"cover"}
          backgroundPosition={"center"}
          flexShrink={0}
        />
        <VStack h={"100%"} gap={2} py={1}>
          <HStack w={"100%"}>
            <Heading size={"sm"}>{novel.title}</Heading>
            <Text fontSize={"xs"} color={"gray.500"} flexShrink={0}>
              {novel.episodeIds.length}편
            </Text>
          </HStack>
          <Box w={"100%"}>
            {novel.description ? (
              <Text
                color={{ base: "gray.700", _dark: "gray.300" }}
                fontSize={"sm"}
              >
                {novel.description}
              </Text>
            ) : (
              <Text color={"gray.500"} fontSize={"sm"}>
                설명이 없습니다.
              </Text>
            )}
          </Box>

          <HStack w={"100%"} flexWrap={"wrap"} gap={1}>
            {novel.tags.map((tag, idx) => (
              <TagChip key={idx}>{tag}</TagChip>
            ))}
          </HStack>
        </VStack>
      </HStack>
    )
  },
)

export default NovelItem
