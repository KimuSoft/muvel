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
import { BlockEntity } from "../../blocks/entities/block.entity"
import { NovelEntity } from "../../novels/novel.entity"
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

  @Column({ type: "float", nullable: true })
  aiRating?: number // 종합 평점 (0.0 ~ 5.0)

  // 에피소드 정보에 의존하는 특정 위젯을 위한 데이터
  @Column({ type: "jsonb", default: {} })
  widgetData: Record<string, Record<string, any>>

  // 솔직히 이거 정말 무성의하지 않아? 아무리 생각해도 테이블 나눠야 하는데 이거
  @Column({ type: "jsonb", nullable: true })
  flowDoc: object

  /** Caches */

  @Column({
    default: 0,
    type: "numeric",
    transformer: {
      to: (value: number) => value, // DB에 저장할 때
      from: (value: string | number) => Number(value), // DB에서 가져올 때
    },
  })
  order: number

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

  /** Dates */

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
