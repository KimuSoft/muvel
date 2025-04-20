import { EpisodeType } from "../enums/episodeType"
import { EditorType } from "../enums/editorType"

export interface Episode {
  id: string
  title: string
  description: string
  chapter: string
  novelId: string
  order: string | number
  episodeType: EpisodeType
  // API 응답을 통해 받으면 string이므로 주의!!
  createdAt: Date
  // API 응답을 통해 받으면 string이므로 주의!!
  updatedAt: Date
  editor: EditorType
}

export const initialPartialEpisode: Episode = {
  id: "",
  title: "",
  chapter: "",
  description: "",
  novelId: "",
  order: "0",
  editor: EditorType.Block,
  episodeType: EpisodeType.Episode,
  createdAt: new Date(),
  updatedAt: new Date(),
}
