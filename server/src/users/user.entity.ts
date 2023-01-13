import { Novel } from "src/novels/novel.entity"
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm"

@Entity()
export class User {
  @PrimaryColumn()
  id: string

  @Column()
  username: string

  @Column()
  avatar: string

  @OneToMany(() => Novel, (novel) => novel.author)
  novels: Novel[]
}
