import { PartialData } from "./index"
import { Block } from "./block.type"

export interface PartialEpisode extends PartialData {
  title: string
  description: string
  chapter: string
  novelId: string
  order: number
}

export interface Episode extends PartialEpisode {
  novel: PartialData
  blocks: Block[]
}

export const initialPartialEpisode: PartialEpisode = {
  id: "",
  title: "",
  chapter: "",
  description: "",
  novelId: "",
  order: 0,
}
