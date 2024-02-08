import React, { useEffect, useMemo, useState } from "react"
import {
  Box,
  HStack,
  Skeleton,
  Text,
  Tooltip,
  useColorMode,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react"
import { EpisodeType, PartialEpisode } from "../../types/episode.type"
import { useLocation } from "react-router-dom"
import { Novel } from "../../types/novel.type"
import {
  SortableContainer,
  SortableContainerProps,
  SortableElement,
} from "react-sortable-hoc"
import { arrayMoveImmutable } from "array-move"
import { api } from "../../utils/api"
import _ from "lodash"

const _SortableContainer = SortableContainer<React.PropsWithChildren>(
  ({ children }: React.PropsWithChildren) => {
    return (
      <VStack align="baseline" borderRadius={10} gap={0}>
        {children}
      </VStack>
    )
  }
)

const EpisodeListSkeleton: React.FC = () => {
  return (
    <VStack align="baseline" borderRadius={10} gap={3}>
      <Skeleton w="240px" h="20px" mt={5} />
      <Skeleton w="120px" h="30px" />
      <Skeleton w="240px" h="30px" />
      <Skeleton w="150px" h="30px" />
      <Skeleton w="300px" h="30px" />
      <Skeleton w="130px" h="20px" mt={5} />
      <Skeleton w="250px" h="30px" />
      <Skeleton w="130px" h="30px" />
      <Skeleton w="400px" h="30px" />
    </VStack>
  )
}

const SortableEpisodeList: React.FC<{
  novel: Novel
  onChange?: () => Promise<unknown>
  isLoading?: boolean
  disableSort?: boolean
}> = ({ novel, onChange, isLoading, disableSort = false }) => {
  const [episodes, setEpisodes] = useState<PartialEpisode[]>(novel.episodes)

  useEffect(() => {
    setEpisodes(novel.episodes)
  }, [novel.episodes])

  useEffect(() => {
    const patch = async () => {
      let order_ = 0
      let subOrder = 0
      const afterEpisodes = episodes.map((e) => {
        if (e.episodeType === EpisodeType.Episode) {
          order_++
          subOrder = 0
        } else subOrder++

        return {
          id: e.id,
          title: e.title,
          chapter: e.chapter,
          order: (order_ + subOrder / 10000).toString(),
        }
      })

      const beforeEpisodes = novel.episodes.map((e) => ({
        id: e.id,
        title: e.title,
        chapter: e.chapter,
        order: e.order,
      }))

      const difference = _.differenceWith(
        afterEpisodes,
        beforeEpisodes,
        _.isEqual
      )

      if (!difference.length) return console.log("no difference")

      await api.patch(`/novels/${novel.id}/episodes`, difference)
      onChange?.().then()
    }
    patch().then()
  }, [episodes])

  const onSortEnd: SortableContainerProps["onSortEnd"] = ({
    oldIndex,
    newIndex,
  }) => setEpisodes(arrayMoveImmutable(episodes, oldIndex, newIndex))

  const episodeRows = useMemo(() => {
    return novel?.episodes?.map((e, idx) => {
      return (
        <SortableEpisodeRow
          episode={e}
          order={e.order}
          key={e.id}
          index={idx}
          disabled={disableSort}
        />
      )
    })
  }, [novel.episodes])

  return !isLoading ? (
    <_SortableContainer onSortEnd={onSortEnd} pressDelay={100} lockAxis="y">
      {episodeRows}
    </_SortableContainer>
  ) : (
    <EpisodeListSkeleton />
  )
}

const SortableEpisodeRow = SortableElement<EpisodeRowProps>(
  (props: EpisodeRowProps) => <EpisodeRow {...props} />
)

const EpisodeRow: React.FC<EpisodeRowProps> = ({ episode, order }) => {
  const location = useLocation()

  const date = useMemo(() => new Date(episode.createdAt), [episode.createdAt])
  const { colorMode } = useColorMode()

  const indexName = useMemo(() => {
    switch (episode.episodeType) {
      case EpisodeType.Prologue:
        return "Pro."
      case EpisodeType.Epilogue:
        return "Ep."
      case EpisodeType.Special:
        return "Sp."
      default:
        return `${order}편`
    }
  }, [episode])

  const isNow = useMemo(
    () =>
      [`/episodes/${episode.id}`, `/episodes/${episode.id}/viewer`].includes(
        location.pathname
      ),
    [location.pathname, episode.id]
  )

  const hoverColor = useColorModeValue("gray.200", "gray.600")

  return (
    // 100글자까지만 보여주고 이후에 ...
    <Tooltip
      label={
        `(${date.getFullYear()}년 ${
          date.getMonth() + 1
        }월 ${date.getDate()}일) ` +
        episode.description.slice(0, 100) +
        "..."
      }
      openDelay={500}
    >
      {episode.episodeType !== EpisodeType.EpisodeGroup ? (
        <VStack
          px={3}
          py={2}
          borderRadius={5}
          cursor="pointer"
          w="100%"
          _hover={{ backgroundColor: hoverColor }}
          transition={"background-color 0.1s ease"}
          align="baseline"
        >
          <HStack>
            <Text
              as={isNow ? "b" : undefined}
              color={
                isNow
                  ? colorMode === "light"
                    ? "purple.500"
                    : "purple.200"
                  : "gray.500"
              }
              fontSize="sm"
              w={8}
            >
              {indexName}
            </Text>
            <Text fontSize="xl">{episode.title}</Text>
          </HStack>
        </VStack>
      ) : (
        <Box
          w="100%"
          mt="10px"
          _hover={{ backgroundColor: hoverColor }}
          transition={"background-color 0.1s ease"}
          userSelect={"none"}
          cursor="pointer"
        >
          <Text
            p="10px"
            pl={3}
            color={
              isNow
                ? colorMode === "light"
                  ? "purple.500"
                  : "purple.200"
                : "gray.500"
            }
          >
            {episode.title}
          </Text>
        </Box>
      )}
    </Tooltip>
  )
}

interface EpisodeRowProps {
  episode: PartialEpisode
  order: string
}

export default SortableEpisodeList
