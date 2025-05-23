import { EpisodeType } from "../enums"
import { EpisodeBlock } from "./block"

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

// *.mvle 형식과 완벽히 대응해야 함
export interface LocalEpisode extends Episode {
  blocks: EpisodeBlock[]
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
