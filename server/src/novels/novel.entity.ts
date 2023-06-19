import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { EpisodeEntity } from "../episodes/episode.entity"
import { UserEntity } from "../users/user.entity"

@Entity()
export class NovelEntity {
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

  @OneToMany(() => EpisodeEntity, (episode) => episode.novel, {
    cascade: true,
  })
  episodes: EpisodeEntity[]

  @ManyToOne(() => UserEntity, (user) => user.novels, {
    onDelete: "CASCADE",
  })
  author: UserEntity
}
