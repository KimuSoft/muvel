import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from "typeorm"
import { BlockEntity } from "../../blocks/block.entity"
import { NovelEntity } from "../../novels/novel.entity"
import { Episode, EpisodeType } from "muvel-api-types"
import { EpisodeSnapshotEntity } from "./episode-snapshot.entity"
import { YUpdateEntity } from "../../crdt/entities/y-update.entity"
import { YSnapshotEntity } from "../../crdt/entities/y-snapshot.entity"

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

  @Column({ type: "jsonb", nullable: true })
  flowDoc: object

  /** Caches */

  @Column({ default: 0, type: "numeric" })
  order: string

  @Column({ default: 0 })
  contentLength: number

  @Column({ default: false })
  isSnapshotted: boolean

  @Column({ default: false })
  isDriveBackup: boolean

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

  @OneToOne(() => YSnapshotEntity, (y) => y.episode)
  ySnapshot: YSnapshotEntity

  @OneToMany(() => YUpdateEntity, (u) => u.episode)
  yUpdates: YUpdateEntity[]

  /** Dates */

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
