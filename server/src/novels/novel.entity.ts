import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm"
import { Episode } from "../episodes/episode.entity"
import { User } from "../users/user.entity"

@Entity()
export class Novel {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column()
  description: string

  @OneToMany(() => Episode, (episode) => episode.novel, {
    cascade: true,
  })
  episodes: Episode[]

  @ManyToOne(() => User, (user) => user.novels, {
    onDelete: "CASCADE",
  })
  author: User
}
