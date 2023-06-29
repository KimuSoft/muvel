import React, { useContext, useEffect, useMemo, useState } from "react"
import {
  HStack,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react"
import { PartialEpisode } from "../../types/episode.type"
import { useLocation, useNavigate } from "react-router-dom"
import { Novel } from "../../types/novel.type"

// const EpisodeList: React.FC = () => {
//   const { novel, episode } = useContext(EditorContext)
//   const [episodeList, setEpisodeList] = useState<JSX.Element[]>([])
//
//   useEffect(() => {
//     const _episodes = novel.episodes.map((e) =>
//       e.id === episode.id ? episode : e
//     )
//
//     const el = _episodes.map((e, idx) => {
//       if (_episodes[idx - 1]?.chapter !== e.chapter) {
//         return (
//           <React.Fragment key={"ct" + e.id}>
//             {e.chapter ? (
//               <Text mt="10px" p="10px">
//                 {e.chapter}
//               </Text>
//             ) : null}
//             <EpisodeElement episode={e} index={idx + 1} />
//           </React.Fragment>
//         )
//       }
//       return <EpisodeElement episode={e} index={idx + 1} key={e.id} />
//     })
//
//     setEpisodeList(el)
//   }, [novel, episode])
//
//   return <Box w="100%">{episodeList}</Box>
// }

const EpisodeList: React.FC<{ novel: Novel }> = ({ novel }) => {
  const [episodeList, setEpisodeList] = useState<JSX.Element[]>([])

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
            <EpisodeRow episode={e} index={idx + 1} />
          </React.Fragment>
        )
      }
      return <EpisodeRow episode={e} index={idx + 1} key={e.id} />
    })

    setEpisodeList(el)
  }, [novel])

  return (
    <VStack align="baseline" borderRadius={10} gap={0}>
      {episodeList}
    </VStack>
  )
}

const EpisodeRow: React.FC<{ episode: PartialEpisode; index: number }> = ({
  episode,
  index,
}) => {
  const location = useLocation()

  const isNow = (episodeId: string) => {
    return location.pathname === `/episodes/${episodeId}`
  }

  const navigate = useNavigate()

  const onClick = () => {
    navigate(`/episodes/${episode.id}`)
  }

  const date = useMemo(() => new Date(episode.createdAt), [episode.createdAt])

  return (
    // 100글자까지만 보여주고 이후에 ...
    <Tooltip
      label={
        `(${date.getFullYear()}년 ${date.getMonth()}월 ${date.getDate()}일) ` +
        episode.description.slice(0, 100) +
        "..."
      }
      openDelay={500}
    >
      <HStack
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
        transition={"background-color 0.3s ease"}
      >
        <Text
          as={isNow(episode.id) ? "b" : undefined}
          color={
            isNow(episode.id)
              ? useColorModeValue("purple.500", "purple.200")
              : "gray.500"
          }
          fontSize="md"
          mr={3}
        >
          {index}편
        </Text>
        <Text fontSize="xl">{episode.title}</Text>
      </HStack>
    </Tooltip>
  )
}

export default EpisodeList
