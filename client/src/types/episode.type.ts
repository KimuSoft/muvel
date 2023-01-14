import { PartialBlock } from "./block.type"
import { PartialData } from "./index"

export interface PartialEpisode extends PartialData {
  title: string
  description: string
  chapter: string
}

export interface Episode extends PartialEpisode {
  novel: PartialData
  blocks: PartialBlock[]
}
