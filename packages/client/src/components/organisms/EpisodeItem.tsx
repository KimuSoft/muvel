import React, { useMemo } from "react"
import { EpisodeType, PartialEpisode } from "../../types/episode.type"
import {
  Box,
  Hide,
  HStack,
  Show,
  Spacer,
  Text,
  Tooltip,
  useColorModeValue,
  useMediaQuery,
  VStack,
} from "@chakra-ui/react"
import { TbBrandZapier, TbRefresh, TbTypography } from "react-icons/tb"
import { useNavigate } from "react-router-dom"

const SideData: React.FC<{ episode: PartialEpisode }> = ({ episode }) => {
  const updatedAt = useMemo(() => {
    return new Date(episode.updatedAt)
  }, [episode.updatedAt])

  const createdAt = useMemo(() => {
    return new Date(episode.createdAt)
  }, [episode.createdAt])

  return (
    <HStack gap={4} flexShrink={0}>
      <HStack gap={1}>
        <TbTypography
          color={"var(--chakra-colors-purple-400)"}
          size={12}
          style={{ flexShrink: 0 }}
        />
        <Text flexShrink={0} fontSize={"xs"} color={"gray.500"}>
          1,400자
        </Text>
      </HStack>
      <Tooltip label={createdAt.toLocaleString() + "에 생성"} openDelay={1000}>
        <HStack gap={1}>
          <TbBrandZapier color={"var(--chakra-colors-purple-400)"} size={12} />
          <Text fontSize={"xs"} color={"gray.500"}>
            {createdAt.getFullYear()}.{createdAt.getMonth() + 1}.
            {createdAt.getDate()}
          </Text>
        </HStack>
      </Tooltip>
      <Tooltip label={createdAt.toLocaleString() + "에 수정"} openDelay={1000}>
        <HStack gap={1}>
          <TbRefresh color={"var(--chakra-colors-purple-400)"} size={12} />
          <Text fontSize={"xs"} color={"gray.500"}>
            {updatedAt.getFullYear()}.{updatedAt.getMonth() + 1}.
            {updatedAt.getDate()}
          </Text>
        </HStack>
      </Tooltip>
    </HStack>
  )
}

const EpisodeItem: React.FC<{
  episode: PartialEpisode
  index: number
  isDrawer?: boolean
}> = ({ episode, index, isDrawer = false }) => {
  const navigate = useNavigate()
  const [_isPC] = useMediaQuery("(min-width: 800px)")
  const isPC = isDrawer ? false : _isPC

  const prefix = useMemo(() => {
    switch (episode.episodeType) {
      case EpisodeType.EpisodeGroup:
        return
      case EpisodeType.Episode:
        // TODO: 임시, 이후 편수를 따로 추가해야 함
        return `${episode.order.toString().padStart(3, "0")}`
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
      py={1}
      cursor={"pointer"}
      onClick={clickHandler}
      borderRadius={4}
      transition={"background-color 0.2s"}
      _hover={{
        backgroundColor: useColorModeValue("gray.100", "gray.700"),
      }}
    >
      <Box flexShrink={0} w={"4px"} h={"44px"} backgroundColor={"purple.500"} />
      {isPC ? (
        <Text
          flexShrink={0}
          color={"purple.500"}
          w={"65px"}
          fontWeight={200}
          fontSize={"36px"}
        >
          {prefix}
        </Text>
      ) : null}
      <VStack gap={0} alignItems={"baseline"}>
        <Text>{episode.title}</Text>
        <Text fontSize={"xs"} color={"gray.500"}>
          {episode.description}
        </Text>
        {!isPC ? <SideData episode={episode} /> : null}
      </VStack>
      <Spacer />
      {isPC ? <SideData episode={episode} /> : null}
    </HStack>
  )
}

export default EpisodeItem
