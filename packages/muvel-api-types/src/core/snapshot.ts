import { Block } from "./block"
import { SnapshotReason } from "../enums"

export interface EpisodeSnapshot {
  id: string
  episodeId: string
  reason: SnapshotReason
  blocks: Block[]
  createdAt: string
}
