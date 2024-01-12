import React, { useMemo } from "react"
import { EpisodeType, PartialEpisode } from "../../types/episode.type"
import {
  Box,
  HStack,
  Spacer,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react"
import { TbBrandZapier, TbRefresh, TbTypography } from "react-icons/tb"
import { useNavigate } from "react-router-dom"

const EpisodeItem: React.FC<{ episode: PartialEpisode; index: number }> = ({
  episode,
  index,
}) => {
  const navigate = useNavigate()

  const prefix = useMemo(() => {
    switch (episode.episodeType) {
      case EpisodeType.EpisodeGroup:
        return
      case EpisodeType.Episode:
        // TODO: 임시, 이후 편수를 따로 추가해야 함
        return `${(index + 1).toString().padStart(3, "0")}`
      case EpisodeType.Prologue:
        return "PR."
      case EpisodeType.Epilogue:
        return "EP."
    }
  }, [episode.episodeType, index])

  const clickHandler = () => {
    navigate(`/episodes/${episode.id}`)
  }

  return episode.episodeType === EpisodeType.EpisodeGroup ? (
    <HStack
      px={3}
      py={0.5}
      borderRadius={14}
      border={"1px solid var(--chakra-colors-purple-500)"}
      userSelect={"none"}
      mt={index ? 4 : 0}
      cursor={"pointer"}
      transition={"background-color 0.2s"}
      onClick={clickHandler}
      _hover={{
        backgroundColor: useColorModeValue("gray.100", "gray.700"),
      }}
    >
      <Text fontSize={"sm"} color={"purple.500"}>
        {episode.title}
      </Text>
    </HStack>
  ) : (
    <HStack
      userSelect={"none"}
      w={"100%"}
      gap={5}
      px={2}
      cursor={"pointer"}
      onClick={clickHandler}
      borderRadius={4}
      transition={"background-color 0.2s"}
      _hover={{
        backgroundColor: useColorModeValue("gray.100", "gray.700"),
      }}
    >
      <Box flexShrink={0} w={"4px"} h={"44px"} backgroundColor={"purple.500"} />
      <Text
        flexShrink={0}
        color={"purple.500"}
        w={"65px"}
        fontWeight={200}
        fontSize={"36px"}
      >
        {prefix}
      </Text>
      <VStack gap={0} alignItems={"baseline"}>
        <Text>{episode.title}</Text>
        <Text fontSize={"xs"} color={"gray.500"}>
          {episode.description}
        </Text>
      </VStack>
      <Spacer />
      <HStack gap={4} flexShrink={0}>
        <HStack gap={1}>
          <TbTypography color={"var(--chakra-colors-purple-400)"} size={12} />
          <Text fontSize={"xs"} color={"gray.500"}>
            1,400자
          </Text>
        </HStack>
        <HStack gap={1}>
          <TbBrandZapier color={"var(--chakra-colors-purple-400)"} size={12} />
          <Text fontSize={"xs"} color={"gray.500"}>
            2024.01.01
          </Text>
        </HStack>
        <HStack gap={1}>
          <TbRefresh color={"var(--chakra-colors-purple-400)"} size={12} />
          <Text fontSize={"xs"} color={"gray.500"}>
            2024.12.31
          </Text>
        </HStack>
      </HStack>
    </HStack>
  )
}

export default EpisodeItem
