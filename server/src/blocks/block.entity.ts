import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { EpisodeEntity } from "../episodes/episode.entity"
import { BlockType } from "../types"

@Entity()
export class BlockEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  content: string

  @Column()
  blockType: BlockType

  @Column()
  order: number

  @ManyToOne(() => EpisodeEntity, (episode) => episode.blocks, {
    onDelete: "CASCADE",
  })
  episode: EpisodeEntity
}
