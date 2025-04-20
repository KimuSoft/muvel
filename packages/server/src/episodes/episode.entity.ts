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
import { EditorType, Episode, EpisodeType } from "muvel-api-types"

@Entity("episode")
export class EpisodeEntity implements Omit<Episode, "createdAt" | "updatedAt"> {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ default: "새 에피소드" })
  title: string

  @Column({ default: "" })
  description: string

  @Column({ default: "" })
  chapter: string

  @Column({ default: "" })
  authorComment: string

  // 임시로 생성 날짜를 기준으로 정렬하도록 함
  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

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

  @Column({ default: 0, type: "numeric" })
  order: string

  @Column({ default: EpisodeType.Episode })
  episodeType: EpisodeType

  @Column({ default: EditorType.RichText })
  editor: EditorType
}
