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
import { EpisodeEntity } from "../episodes/entities/episode.entity"
import { UserEntity } from "../users/user.entity"
import { Novel, ShareType } from "muvel-api-types"

@Entity("novel")
export class NovelEntity implements Novel {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  title: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  thumbnail: string

  @Column("text", { array: true, default: [] })
  tags: string[] = []

  @OneToMany(() => EpisodeEntity, (episode) => episode.novel, {
    cascade: true,
  })
  episodes: EpisodeEntity[]

  @Column({ default: 0 })
  episodeCount: number

  @ManyToOne(() => UserEntity, (user) => user.novels, {
    onDelete: "CASCADE",
  })
  author: UserEntity

  @RelationId((self: NovelEntity) => self.author)
  authorId: string

  @Column({ default: ShareType.Private })
  share: ShareType

  @Column({ default: 0, type: "numeric" })
  order: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
