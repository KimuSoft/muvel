import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm"
import { EpisodeEntity } from "./episode.entity"
import { BlockEntity } from "../blocks/block.entity"

@Entity("episode_snapshot")
export class EpisodeSnapshotEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => EpisodeEntity, { onDelete: "CASCADE" })
  episode: EpisodeEntity

  @RelationId((snapshot: EpisodeSnapshotEntity) => snapshot.episode)
  episodeId: string

  @Column({ type: "jsonb" })
  blocks: BlockEntity[]

  @CreateDateColumn()
  createdAt: Date
}
