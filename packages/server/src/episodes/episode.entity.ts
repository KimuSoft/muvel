import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from "typeorm"
import { BlockEntity } from "../blocks/block.entity"
import { NovelEntity } from "../novels/novel.entity"
import { Episode, EpisodeType } from "muvel-api-types"
import { EpisodeSnapshotEntity } from "./episode-snapshot.entity"

@Entity("episode")
export class EpisodeEntity implements Omit<Episode, "createdAt" | "updatedAt"> {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ default: "새 에피소드" })
  title: string

  @Column({ default: EpisodeType.Episode })
  episodeType: EpisodeType

  @Column({ default: "" })
  description: string

  @Column({ default: "" })
  authorComment: string

  /** Caches */

  @Column({ default: 0, type: "numeric" })
  order: string

  @Column({ default: true })
  isSnapshotted: boolean

  /** Relations */

  @ManyToOne(() => NovelEntity, (novel) => novel.episodes, {
    onDelete: "CASCADE",
  })
  novel: NovelEntity

  @RelationId((episode: EpisodeEntity) => episode.novel)
  novelId: string

  @OneToMany(() => BlockEntity, (block) => block.episode, {
    cascade: true,
  })
  blocks: BlockEntity[]

  @OneToMany(() => EpisodeSnapshotEntity, (snapshot) => snapshot.episode, {
    cascade: true,
  })
  snapshots: EpisodeSnapshotEntity[]

  /** Dates */

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
