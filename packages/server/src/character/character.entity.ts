import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { Character, CharacterImportance } from "muvel-api-types"

@Entity("character")
export class CharacterEntity implements Character {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ nullable: true })
  avatar: string | null

  @Column({ array: true, default: [] })
  tags: string[]

  @Column()
  summary: string

  @Column()
  description: string

  @Column({ array: true, default: [] })
  galleries: string[]

  @Column()
  importance: CharacterImportance

  @Column()
  document: string

  @Column({ type: "jsonb", default: {} })
  attributes: Record<string, string>
}
