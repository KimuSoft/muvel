import { Block } from "./block"
import { SnapshotReason } from "../enums/snapshotReason"

export interface EpisodeSnapshot {
  id: string
  episodeId: string
  reason: SnapshotReason
  blocks: Block[]
  createdAt: Date
}
