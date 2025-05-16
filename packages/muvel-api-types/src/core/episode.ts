import { EpisodeType } from "../enums"

export interface Episode {
  id: string
  title: string
  description: string
  authorComment?: string
  contentLength: number
  aiRating?: number
  novelId: string
  order: number
  episodeType: EpisodeType
  flowDoc: any
  createdAt: string
  updatedAt: string
}

export const initialEpisode: Episode = {
  id: "",
  title: "",
  authorComment: "",
  description: "",
  contentLength: 0,
  flowDoc: {},
  novelId: "",
  order: 0,
  episodeType: EpisodeType.Episode,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
