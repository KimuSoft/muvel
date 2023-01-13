import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm"
import { Block } from "../blocks/block.entity"
import { Novel } from "../novels/novel.entity"

@Entity()
export class Episode {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column()
  description: string

  @Column()
  chapter: string

  @ManyToOne(() => Novel, (novel) => novel.episodes)
  novel: Novel

  @OneToMany(() => Block, (block) => block.episode, { cascade: true })
  blocks: Block[]
}
