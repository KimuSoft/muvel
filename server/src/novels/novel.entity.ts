import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from "typeorm"
import { EpisodeEntity } from "../episodes/episode.entity"
import { UserEntity } from "../users/user.entity"

@Entity("novel")
export class NovelEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  title: string

  @Column({ nullable: true })
  description: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => EpisodeEntity, (episode) => episode.novel, {
    cascade: true,
  })
  episodes: EpisodeEntity[]

  @RelationId((self: NovelEntity) => self.episodes)
  episodeIds: string[]

  @ManyToOne(() => UserEntity, (user) => user.novels, {
    onDelete: "CASCADE",
  })
  author: UserEntity

  @RelationId((self: NovelEntity) => self.author)
  authorId: string
}
