import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity("character")
export class CharacterEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column()
  description: string

  @Column()
  importance: number

  @Column()
  image: string

  @Column()
  document: string

  @Column({ type: "json" })
  properties: Map<string, string>

  // @ManyToOne(() => Novel, (novel) => novel.characters, {
  //   onDelete: "CASCADE",
  // })
  // blocks: Novel
}
