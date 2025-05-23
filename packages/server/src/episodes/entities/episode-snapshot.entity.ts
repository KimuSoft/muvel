import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm"
import { EpisodeEntity } from "./episode.entity"
import { EpisodeBlockEntity } from "../../blocks/entities/episode-block.entity"
import { SnapshotReason } from "muvel-api-types"

@Entity("episode_snapshot")
export class EpisodeSnapshotEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => EpisodeEntity, { onDelete: "CASCADE" })
  episode: EpisodeEntity

  @RelationId((snapshot: EpisodeSnapshotEntity) => snapshot.episode)
  episodeId: string

  @Column({ type: "jsonb" })
  blocks: EpisodeBlockEntity[]

  @Column({
    type: "enum",
    enum: SnapshotReason,
    default: SnapshotReason.Autosave,
  })
  reason: SnapshotReason

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date
}
