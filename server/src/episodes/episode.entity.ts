import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { BlockEntity } from "../blocks/block.entity"
import { NovelEntity } from "../novels/novel.entity"

@Entity()
export class EpisodeEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  title: string

  @Column()
  description: string

  @Column()
  chapter: string

  // 임시로 생성 날짜를 기준으로 정렬하도록 함
  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => NovelEntity, (novel) => novel.episodes, {
    onDelete: "CASCADE",
  })
  novel: NovelEntity

  @OneToMany(() => BlockEntity, (block) => block.episode, {
    cascade: true,
  })
  blocks: BlockEntity[]
}
