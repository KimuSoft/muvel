import { EpisodeType, type NovelEpisodeContext } from "muvel-api-types"

// order(편수)를 다시 부여하는 함수
export const reorderEpisode = (
  episodes: NovelEpisodeContext[],
): ReorderedEpisode[] => {
  // 앞 순서부터 시작. 0부터 시작해서 EpisodeType이 Episode면 +1, 아니면 +0.0001
  let order = 0
  return episodes.map((episode) => {
    if (episode.episodeType === EpisodeType.Episode) {
      order = Math.round(order + 1)
    } else {
      order += 0.0001
    }
    const isReordered = parseFloat(episode.order.toString()) !== order
    return { ...episode, order, isReordered }
  })
}

export type ReorderedEpisode = NovelEpisodeContext & {
  isReordered: boolean
}
