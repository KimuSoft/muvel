import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { Episode } from "../episodes/episode.entity"
import { User } from "../users/user.entity"

@Entity()
export class Novel {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  title: string

  @Column()
  description: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => Episode, (episode) => episode.novel, {
    cascade: true,
  })
  episodes: Episode[]

  @ManyToOne(() => User, (user) => user.novels, {
    onDelete: "CASCADE",
  })
  author: User
}
