import React, { forwardRef, useMemo } from "react"
import { type Episode, EpisodeType } from "muvel-api-types"
import {
  Box,
  HStack,
  Skeleton,
  type StackProps,
  Text,
  VStack,
} from "@chakra-ui/react"
import { TbBrandZapier, TbRefresh, TbStar, TbTypography } from "react-icons/tb"
import { useNavigate } from "react-router"
import { Tooltip } from "~/components/ui/tooltip"
import { getTimeAgoKo } from "~/utils/getTimeAgoKo"

const SideData: React.FC<{ episode: Episode } & StackProps> = ({
  episode,
  ...props
}) => {
  const updatedAt = useMemo(() => {
    return new Date(episode.updatedAt)
  }, [episode.updatedAt])

  const createdAt = useMemo(() => {
    return new Date(episode.createdAt)
  }, [episode.createdAt])

  return (
    <HStack columnGap={4} flexShrink={0} rowGap={1} {...props}>
      {episode.aiRating !== null ? (
        <HStack gap={1}>
          <TbStar
            color={"var(--chakra-colors-purple-400)"}
            size={12}
            style={{ flexShrink: 0 }}
          />
          <Text flexShrink={0} fontSize={"xs"} color={"gray.500"}>
            {episode.aiRating?.toFixed(1)}
          </Text>
        </HStack>
      ) : null}
      <HStack gap={1}>
        <TbTypography
          color={"var(--chakra-colors-purple-400)"}
          size={12}
          style={{ flexShrink: 0 }}
        />
        <Text flexShrink={0} fontSize={"xs"} color={"gray.500"}>
          {episode.contentLength.toLocaleString()}자
        </Text>
      </HStack>
      <Tooltip
        content={createdAt.toLocaleString() + "에 생성"}
        openDelay={1000}
      >
        <HStack gap={1}>
          <TbBrandZapier color={"var(--chakra-colors-purple-400)"} size={12} />
          <Text fontSize={"xs"} color={"gray.500"}>
            {getTimeAgoKo(createdAt)}
          </Text>
        </HStack>
      </Tooltip>
      <Tooltip content={createdAt.toLocaleString() + "에 수정"}>
        <HStack gap={1}>
          <TbRefresh color={"var(--chakra-colors-purple-400)"} size={12} />
          <Text fontSize={"xs"} color={"gray.500"}>
            {getTimeAgoKo(updatedAt)}
          </Text>
        </HStack>
      </Tooltip>
    </HStack>
  )
}

export type EpisodeItemVariant = "detail" | "simple" | "shallow" | "grid"

export type EpisodeItemProps = StackProps & {
  episode: Episode
  index: number
  loading?: boolean
  variant?: EpisodeItemVariant
}

const EpisodeItem = forwardRef<HTMLDivElement, EpisodeItemProps>(
  ({ episode, index, loading, variant = "simple", ...props }, ref) => {
    const navigate = useNavigate()

    const prefix = useMemo(() => {
      switch (episode.episodeType) {
        case EpisodeType.EpisodeGroup:
          return
        case EpisodeType.Episode:
          // TODO: 임시, 이후 편수를 따로 추가해야 함
          return `${episode.order.toString().padStart(3, "0")}`
        case EpisodeType.Prologue:
          return "PRO"
        case EpisodeType.Epilogue:
          return "EPIL"
        case EpisodeType.Special:
          return "SPE"
      }
    }, [episode.episodeType, index])

    const episodeCountText = useMemo(() => {
      if (episode.episodeType === EpisodeType.Episode) {
        return `${Math.round(parseFloat(episode.order.toString()))}편`
      } else if (episode.episodeType === EpisodeType.Prologue) {
        return "프롤로그"
      } else if (episode.episodeType === EpisodeType.Epilogue) {
        return "에필로그"
      } else if (episode.episodeType === EpisodeType.Special) {
        return "특별편"
      }
    }, [episode.episodeType, episode.order])

    const clickHandler = () => {
      navigate(`/episodes/${episode.id}`)
    }
    if (episode.episodeType === EpisodeType.EpisodeGroup)
      return (
        <Box w={"100%"} ref={ref} {...props}>
          <Skeleton loading={!!loading}>
            <Box
              px={3}
              py={1}
              borderRadius={5}
              borderWidth={1}
              borderColor={"purple.500"}
              userSelect={"none"}
              mt={index ? 4 : 0}
              mb={2}
              cursor={"pointer"}
              transition={"background-color 0.2s"}
              onClick={clickHandler}
              _hover={{
                backgroundColor: { base: "gray.100", _dark: "gray.700" },
              }}
            >
              <Text fontSize={"sm"} color={"purple.500"}>
                {episode.title}
              </Text>
            </Box>
          </Skeleton>
        </Box>
      )

    return (
      <Skeleton w={"100%"} loading={!!loading}>
        <HStack
          userSelect={"none"}
          w={"100%"}
          gap={5}
          cursor={"pointer"}
          onClick={clickHandler}
          overflow={"hidden"}
          transition={"border-color 0.2s"}
          border={"1px solid transparent"}
          _hover={{
            borderColor: { base: "purple.300", _dark: "purple.500" },
          }}
          align={"stretch"}
          ref={ref}
          {...props}
        >
          <Box flexShrink={0} w={"4px"} backgroundColor={"purple.500"} />
          <Text
            flexShrink={0}
            color={"purple.500"}
            w={"68px"}
            fontWeight={200}
            fontSize={"36px"}
            display={
              variant !== "detail" ? "none" : { base: "none", md: "block" }
            }
          >
            {prefix}
          </Text>
          <VStack
            gap={1}
            py={1.5}
            flex={1}
            alignItems={"baseline"}
            overflow={"hidden"}
          >
            <HStack w={"100%"} overflow={"hidden"}>
              <Text
                display={
                  variant !== "detail" ? "block" : { base: "block", md: "none" }
                }
                color={"purple.500"}
                fontWeight={600}
                flexShrink={0}
                minW={"32px"}
              >
                {episodeCountText}
              </Text>
              <Text truncate>{episode.title || "제목 없음"}</Text>
            </HStack>
            {variant !== "simple" && (
              <Tooltip content={episode.description}>
                <Text fontSize={"xs"} color={"gray.500"} maxW={"100%"} truncate>
                  {episode.description}
                </Text>
              </Tooltip>
            )}
            <Box
              display={
                variant === "shallow"
                  ? "flex"
                  : variant === "detail"
                    ? { base: "flex", md: "none" }
                    : "none"
              }
            >
              <SideData episode={episode} />
            </Box>
          </VStack>
          <Box
            display={
              variant !== "detail" ? "none" : { base: "none", md: "flex" }
            }
          >
            <SideData episode={episode} mr={3} />
          </Box>
        </HStack>
      </Skeleton>
    )
  },
)

export default EpisodeItem
