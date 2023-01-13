import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Episode } from "../episodes/episode.entity"
import { BlockType } from "../types"

@Entity()
export class Block {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  content: string

  @Column()
  blockType: BlockType

  @ManyToOne(() => Episode, (episode) => episode.blocks)
  episode: Episode
}
