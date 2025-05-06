import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { EpisodeEntity } from "../episodes/entities/episode.entity"
import { Block, BlockAttrs, BlockType, PMNodeJSON } from "muvel-api-types"

@Entity("block")
export class BlockEntity implements Block {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  text: string

  @Column({ type: "jsonb", default: [] })
  content: PMNodeJSON[]

  @Column({ type: "jsonb", nullable: true })
  attr: BlockAttrs | null

  @Column({ enum: BlockType, default: BlockType.Describe })
  blockType: BlockType

  @Column()
  order: number

  @ManyToOne(() => EpisodeEntity, (episode) => episode.blocks, {
    onDelete: "CASCADE",
  })
  episode: EpisodeEntity

  @UpdateDateColumn()
  updatedAt: Date
}
