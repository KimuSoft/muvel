import React from "react"
import { type Episode, EpisodeType } from "muvel-api-types"
import { HStack, SimpleGrid, VStack } from "@chakra-ui/react"
import EpisodeGridItem from "../molecules/EpisodeGridItem" // 방금 만든 컴포넌트
import EpisodeItem from "../molecules/EpisodeItem" // 기존 EpisodeItem

interface EpisodeGridProps {
  episodes: Episode[]
  loading?: boolean
}

const EpisodeGrid: React.FC<EpisodeGridProps> = ({ episodes, loading }) => {
  // 에피소드들을 그룹과 일반 에피소드 청크로 분리
  const groupedEpisodes: (Episode | Episode[])[] = []
  let currentChunk: Episode[] = []

  episodes.forEach((episode) => {
    if (episode.episodeType === EpisodeType.EpisodeGroup) {
      if (currentChunk.length > 0) {
        groupedEpisodes.push(currentChunk)
        currentChunk = []
      }
      groupedEpisodes.push(episode) // EpisodeGroup 자체도 추가
    } else {
      currentChunk.push(episode)
    }
  })

  if (currentChunk.length > 0) {
    groupedEpisodes.push(currentChunk) // 마지막 남은 청크 추가
  }

  return (
    <VStack spacing={4} align="stretch" w="100%">
      {groupedEpisodes.map((groupOrChunk, index) => {
        if (Array.isArray(groupOrChunk)) {
          // 일반 에피소드 청크 (SimpleGrid로 렌더링)
          if (groupOrChunk.length === 0) return null
          return (
            <HStack flexWrap={"wrap"} w={"100%"} gap={1} key={`grid-${index}`}>
              {groupOrChunk.map((episode) => (
                <EpisodeGridItem
                  key={episode.id}
                  episode={episode}
                  loading={loading}
                  // novelThumbnail={novelThumbnail}
                />
              ))}
            </HStack>
          )
        } else {
          // EpisodeGroup (EpisodeItem으로 렌더링)
          // EpisodeItem은 내부적으로 EpisodeGroup일 때 전체 너비를 사용하도록 스타일링 되어 있음
          return (
            <EpisodeItem
              key={groupOrChunk.id}
              episode={groupOrChunk}
              index={index} // EpisodeItem의 mt 계산에 사용될 수 있음
              loading={loading}
              variant="detail" // 또는 그룹에 맞는 다른 variant
              // EpisodeItem은 width="100%"를 이미 가지고 있을 수 있음
              // 필요하다면 Box로 한번 더 감싸서 스타일 제어
              // w="100%" // 확실하게 전체 너비 사용
            />
          )
        }
      })}
      {/* 로딩 중이고 에피소드가 없을 때의 스켈레톤 (선택적) */}
      {loading && episodes.length === 0 && (
        <SimpleGrid minChildWidth="150px" spacing={4} /* gap={4} */>
          {[...Array(6)].map((_, i) => (
            <EpisodeGridItem
              key={`skeleton-${i}`}
              episode={{} as Episode}
              loading={true}
            />
          ))}
        </SimpleGrid>
      )}
    </VStack>
  )
}

export default EpisodeGrid
