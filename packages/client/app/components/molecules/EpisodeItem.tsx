import React, { forwardRef, useMemo } from "react"
import { EpisodeType, type Episode } from "muvel-api-types"
import {
  Box,
  HStack,
  Skeleton,
  Spacer,
  type StackProps,
  Text,
  VStack,
} from "@chakra-ui/react"
import { TbBrandZapier, TbRefresh, TbTypography } from "react-icons/tb"
import { useNavigate } from "react-router"
import { Tooltip } from "~/components/ui/tooltip"

const SideData: React.FC<{ episode: Episode }> = ({ episode }) => {
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
      <Tooltip
        content={createdAt.toLocaleString() + "에 생성"}
        openDelay={1000}
      >
        <HStack gap={1}>
          <TbBrandZapier color={"var(--chakra-colors-purple-400)"} size={12} />
          <Text fontSize={"xs"} color={"gray.500"}>
            {createdAt.getFullYear()}.{createdAt.getMonth() + 1}.
            {createdAt.getDate()}
          </Text>
        </HStack>
      </Tooltip>
      <Tooltip
        content={createdAt.toLocaleString() + "에 수정"}
        openDelay={1000}
      >
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

export type EpisodeItemProps = StackProps & {
  episode: Episode
  index: number
  isDrawer?: boolean
  loading?: boolean
}

const EpisodeItem = forwardRef<HTMLDivElement, EpisodeItemProps>(
  ({ episode, index, loading, isDrawer = false, ...props }, ref) => {
    const navigate = useNavigate()

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
          pr={3}
          py={1}
          cursor={"pointer"}
          onClick={clickHandler}
          overflow={"hidden"}
          borderRadius={4}
          border={"1px solid transparent"}
          _hover={{
            borderColor: { base: "purple.300", _dark: "purple.500" },
          }}
          ref={ref}
          {...props}
        >
          <Box
            flexShrink={0}
            w={"4px"}
            h={isDrawer ? "50px" : { base: "70px", md: "44px" }}
            backgroundColor={"purple.500"}
          />
          <Text
            flexShrink={0}
            color={"purple.500"}
            w={"65px"}
            fontWeight={200}
            fontSize={"36px"}
            display={isDrawer ? "none" : { base: "none", md: "block" }}
          >
            {prefix}
          </Text>
          <VStack gap={1} alignItems={"baseline"}>
            <HStack w={"100%"} overflow={"hidden"}>
              <Text
                display={isDrawer ? "block" : { base: "block", md: "none" }}
                color={"purple.500"}
                fontWeight={600}
                flexShrink={0}
              >
                {episode.order}편
              </Text>
              <Text truncate>{episode.title}</Text>
            </HStack>
            {!isDrawer && (
              <Text fontSize={"xs"} color={"gray.500"}>
                {episode.description}
              </Text>
            )}
            <Box
              display={
                isDrawer
                  ? "flex"
                  : {
                      base: "flex",
                      md: "none",
                    }
              }
            >
              <SideData episode={episode} />
            </Box>
          </VStack>
          <Spacer />
          <Box
            display={
              isDrawer
                ? "none"
                : {
                    base: "none",
                    md: "flex",
                  }
            }
          >
            <SideData episode={episode} />
          </Box>
        </HStack>
      </Skeleton>
    )
  },
)

export default EpisodeItem
