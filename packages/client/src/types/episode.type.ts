import { PartialData } from "./index"
import { Block } from "./block.type"

export interface PartialEpisode extends PartialData {
  title: string
  description: string
  chapter: string
  novelId: string
  order: string
  episodeType: EpisodeType
  createdAt: string
  updatedAt: string
  editable: boolean
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
  order: "0",
  editable: true,
  episodeType: EpisodeType.Episode,
  createdAt: new Date().toDateString(),
  updatedAt: new Date().toDateString(),
}
