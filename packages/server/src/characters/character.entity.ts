import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from "typeorm"
import { Character, CharacterImportance } from "muvel-api-types"
import { NovelEntity } from "../novels/novel.entity"

@Entity("character")
export class CharacterEntity implements Character {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ nullable: true })
  avatar: string | null = null

  @Column({ array: true, default: [] })
  tags: string[]

  @Column()
  summary: string

  @Column({ array: true, default: [] })
  galleries: string[]

  @Column()
  importance: CharacterImportance

  @Column({ type: "jsonb", default: {} })
  attributes: Record<string, string>

  /** Relations */

  @ManyToOne(() => NovelEntity, (novel) => novel.characters, {
    onDelete: "CASCADE",
  })
  novel: NovelEntity

  @RelationId((character: CharacterEntity) => character.novel)
  novelId: string

  /** Dates */

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
