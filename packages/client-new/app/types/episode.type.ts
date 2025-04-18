import type { PartialData } from "./index"
import type { Block } from "./block.type"

export interface PartialEpisode extends PartialData {
  title: string
  description: string
  chapter: string
  novelId: string
  order: string
  episodeType: EpisodeType
  createdAt: string
  updatedAt: string
  editor: EditorType
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

export enum EditorType {
  Block = 0,
  RichText = 1,
  Flow = 2,
}

export const initialPartialEpisode: PartialEpisode = {
  id: "",
  title: "",
  chapter: "",
  description: "",
  novelId: "",
  order: "0",
  editable: true,
  editor: EditorType.Block,
  episodeType: EpisodeType.Episode,
  createdAt: new Date().toDateString(),
  updatedAt: new Date().toDateString(),
}
