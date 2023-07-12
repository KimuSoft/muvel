import React, { ReactElement, useEffect, useMemo, useState } from "react"
import {
  HStack,
  Text,
  Tooltip,
  useColorMode,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react"
import { PartialEpisode } from "../../types/episode.type"
import { useLocation, useNavigate } from "react-router-dom"
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

const EpisodeList: React.FC<{
  novel: Novel
  refresh?: () => Promise<unknown>
}> = ({ novel, refresh }) => {
  const [episodeList, setEpisodeList] = useState<ReactElement[]>([])
  const [episodes, setEpisodes] = useState<PartialEpisode[]>(novel.episodes)

  useEffect(() => {
    setEpisodes(novel.episodes)
  }, [novel.episodes])

  useEffect(() => {
    const patch = async () => {
      const _episodes = episodes.map((e, idx) => ({ ...e, order: idx }))

      const difference = _.differenceWith(
        _episodes.map((b, order) => ({ ...b, order })),
        novel.episodes.map((b, order) => ({ ...b, order })),
        _.isEqual
      ).map((e) => ({
        id: e.id,
        title: e.title,
        order: e.order,
        description: e.description,
      }))

      if (!difference.length) return

      console.log("패치합니당")
      await api.patch(`/novels/${novel.id}/episodes`, difference)
      refresh?.().then()
    }
    patch().then()
  }, [episodes])

  const onSortEnd: SortableContainerProps["onSortEnd"] = ({
    oldIndex,
    newIndex,
  }) => setEpisodes(arrayMoveImmutable(episodes, oldIndex, newIndex))

  useEffect(() => {
    const el = novel?.episodes?.map((e, idx) => {
      if (novel.episodes[idx - 1]?.chapter !== e.chapter) {
        return (
          <React.Fragment key={"ct" + e.id}>
            {e.chapter ? (
              <Text mt="10px" p="10px" pl={3} color="gray.500">
                {e.chapter}
              </Text>
            ) : null}
            <SortableEpisodeRow episode={e} order={idx + 1} index={idx} />
          </React.Fragment>
        )
      }
      return (
        <SortableEpisodeRow
          episode={e}
          order={idx + 1}
          key={e.id}
          index={idx}
        />
      )
    })
    setEpisodeList(el)
  }, [novel])

  return (
    <_SortableContainer onSortEnd={onSortEnd} pressDelay={100} lockAxis="y">
      {episodeList}
    </_SortableContainer>
  )
}

const SortableEpisodeRow = SortableElement<EpisodeRowProps>(
  (props: EpisodeRowProps) => <EpisodeRow {...props} />
)

const EpisodeRow: React.FC<EpisodeRowProps> = ({ episode, order }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const date = useMemo(() => new Date(episode.createdAt), [episode.createdAt])
  const { colorMode } = useColorMode()

  const isNow = (episodeId: string) =>
    location.pathname === `/episodes/${episodeId}`

  const onClick = () => navigate(`/episodes/${episode.id}`)

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
      <VStack
        onClick={onClick}
        pl={3}
        pr={3}
        pt={2}
        pb={2}
        borderRadius={5}
        cursor="pointer"
        w="100%"
        _hover={{
          backgroundColor: useColorModeValue("gray.200", "gray.600"),
        }}
        transition={"background-color 0.1s ease"}
        align="baseline"
      >
        <HStack>
          <Text
            as={isNow(episode.id) ? "b" : undefined}
            color={
              isNow(episode.id)
                ? colorMode === "light"
                  ? "purple.500"
                  : "purple.200"
                : "gray.500"
            }
            fontSize="sm"
            w={8}
          >
            {order}편
          </Text>
          <Text fontSize="xl">{episode.title}</Text>
        </HStack>
        {/*<HStack color={useColorModeValue("gray.300", "gray.500")}>*/}
        {/*  <FaClock />*/}
        {/*  <Text fontSize="sm">*/}
        {/*    {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일*/}
        {/*  </Text>*/}
        {/*</HStack>*/}
      </VStack>
    </Tooltip>
  )
}

interface EpisodeRowProps {
  episode: PartialEpisode
  order: number
}

export default EpisodeList
