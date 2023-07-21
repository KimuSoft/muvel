import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from "typeorm"
import { EpisodeEntity } from "../episodes/episode.entity"
import { UserEntity } from "../users/user.entity"
import { ShareType } from "../types"

@Entity("novel")
export class NovelEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  title: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  thumbnail: string

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

  @Column({ default: ShareType.Private })
  share: ShareType

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
