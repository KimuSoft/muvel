import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { Block } from "../blocks/block.entity"
import { Novel } from "../novels/novel.entity"

@Entity()
export class Episode {
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

  @ManyToOne(() => Novel, (novel) => novel.episodes, {
    onDelete: "CASCADE",
  })
  novel: Novel

  @OneToMany(() => Block, (block) => block.episode, {
    cascade: true,
  })
  blocks: Block[]
}
