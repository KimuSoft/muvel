import { PartialData } from "./index"
import { PartialEpisode } from "./episode.type"

export interface PartialNovel extends PartialData {
  title: string
  description: string
}

export interface Novel extends PartialNovel {
  author: PartialData
  episodes: PartialEpisode[]
}
