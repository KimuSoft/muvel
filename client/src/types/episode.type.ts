import { PartialData } from "./index"
import { Block } from "./block.type"

export interface PartialEpisode extends PartialData {
  title: string
  description: string
  chapter: string
  novelId: string
  order: number
  episodeType: EpisodeType
  createdAt: Date
  updatedAt: Date
}

export interface Episode extends PartialEpisode {
  novel: PartialData
  blocks: Block[]
}

export enum EpisodeType {
  Episode,
  EpisodeGroup,
  Prologue,
  Epilogue,
  Special,
}

export const initialPartialEpisode: PartialEpisode = {
  id: "",
  title: "",
  chapter: "",
  description: "",
  novelId: "",
  order: 0,
  episodeType: EpisodeType.Episode,
  createdAt: new Date(),
  updatedAt: new Date(),
}
