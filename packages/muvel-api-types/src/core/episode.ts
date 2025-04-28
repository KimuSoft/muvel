import { EpisodeType } from "../enums"

export interface Episode {
  id: string
  title: string
  description: string
  authorComment?: string
  contentLength: number
  novelId: string
  order: string | number
  episodeType: EpisodeType
  flowDoc: any
  // API 응답을 통해 받으면 string이므로 주의!!
  createdAt: Date
  // API 응답을 통해 받으면 string이므로 주의!!
  updatedAt: Date
}

export const initialEpisode: Episode = {
  id: "",
  title: "",
  authorComment: "",
  description: "",
  contentLength: 0,
  flowDoc: {},
  novelId: "",
  order: "0",
  episodeType: EpisodeType.Episode,
  createdAt: new Date(),
  updatedAt: new Date(),
}
