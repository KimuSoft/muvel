import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Episode } from "../episodes/episode.entity"
import { BlockType } from "../types"

@Entity()
export class Block {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  content: string

  @Column()
  blockType: BlockType

  @Column()
  order: number

  @ManyToOne(() => Episode, (episode) => episode.blocks, {
    onDelete: "CASCADE",
  })
  episode: Episode
}
