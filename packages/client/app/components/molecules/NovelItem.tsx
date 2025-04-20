import React, { forwardRef } from "react"
import {
  Box,
  Heading,
  HStack,
  Image,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react"
import { type Novel, ShareType } from "muvel-api-types"
import { useNavigate } from "react-router"

const NovelItem = forwardRef<HTMLDivElement, { novel: Novel }>(
  ({ novel, ...props }, ref) => {
    const navigate = useNavigate()

    return (
      <HStack
        rounded={5}
        h="152px"
        cursor={"pointer"}
        onClick={() => navigate(`/novels/${novel.id}`)}
        userSelect={"none"}
        ref={ref}
        borderWidth={1}
        borderColor={"transparent"}
        overflow={"hidden"}
        transition={"border-color 0.2s"}
        _hover={{ borderColor: { base: "gray.100", _dark: "purple.500" } }}
        {...props}
      >
        <Image
          w="100px"
          h="150px"
          borderRadius={"md"}
          bgColor={{ base: "gray.200", _dark: "gray.800" }}
          src={
            novel.thumbnail
              ? `${novel.thumbnail}/thumbnail?width=100`
              : "/cover.png"
          }
          backgroundRepeat={"no-repeat"}
          backgroundSize={"cover"}
          backgroundPosition={"center"}
          flexShrink={0}
        />
        <VStack h={"100%"} gap={2} px={3} py={1}>
          <HStack w={"100%"}>
            <Heading size={"sm"}>{novel.title}</Heading>
            <Text fontSize={"xs"} color={"gray.500"} flexShrink={0}>
              {novel.episodeCount}편
            </Text>
          </HStack>
          <Box w={"100%"}>
            {novel.description ? (
              <Text
                color={{ base: "gray.700", _dark: "gray.300" }}
                fontSize={"sm"}
                css={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3, // 줄 수 조절
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
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
            <Tag.Root
              size={"sm"}
              colorPalette={
                novel.share === ShareType.Private ? "gray" : "purple"
              }
              variant={"subtle"}
            >
              <Tag.Label>
                {novel.share === ShareType.Private
                  ? "비공개"
                  : novel.share === ShareType.Public
                    ? "공개"
                    : "일부 공개"}
              </Tag.Label>
            </Tag.Root>
            {novel.tags.map((tag, idx) => (
              <Tag.Root
                size={"sm"}
                colorPalette={"gray"}
                key={idx}
                variant={"subtle"}
              >
                <Tag.Label>{tag}</Tag.Label>
              </Tag.Root>
            ))}
          </HStack>
        </VStack>
      </HStack>
    )
  },
)

export default NovelItem
