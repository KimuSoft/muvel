import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { EpisodeEntity } from "../episodes/entities/episode.entity"
import { Block, BlockAttrs, BlockType, PMNodeJSON } from "muvel-api-types"

@Index("IDX_block_episode_order", ["episodeId", "order"])
@Entity("block")
export class BlockEntity implements Omit<Block, "updatedAt"> {
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

  @Column({ nullable: true })
  episodeId: string

  @UpdateDateColumn()
  updatedAt: Date
}
