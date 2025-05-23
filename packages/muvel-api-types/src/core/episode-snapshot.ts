import { EpisodeBlock } from "./block"
import { SnapshotReason } from "../enums"

export interface EpisodeSnapshot {
  id: string
  episodeId: string
  reason: SnapshotReason
  blocks: EpisodeBlock[]
  createdAt: string
}
