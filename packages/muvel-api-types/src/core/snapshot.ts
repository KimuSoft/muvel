import { Block } from "./block"

export interface EpisodeSnapshot {
  id: string
  episodeId: string
  blocks: Block[]
  createdAt: Date
}
