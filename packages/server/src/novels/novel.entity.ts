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
import { WikiPageEntity } from "../wiki-pages/wiki-page.entity"

@Entity("novel")
export class NovelEntity implements Omit<Novel, "createdAt" | "updatedAt"> {
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

  @Column({ default: ShareType.Private })
  share: ShareType

  @Column({ default: 0, type: "numeric" })
  order: number

  @Column({ default: 0 })
  episodeCount: number

  /** Relations */

  @OneToMany(() => EpisodeEntity, (episode) => episode.novel, {
    cascade: true,
  })
  episodes: EpisodeEntity[]

  @OneToMany(() => WikiPageEntity, (wikiPage) => wikiPage.novel, {
    cascade: true,
  })
  wikiPages: WikiPageEntity[]

  @ManyToOne(() => UserEntity, (user) => user.novels, {
    onDelete: "CASCADE",
  })
  author: UserEntity

  @RelationId((self: NovelEntity) => self.author)
  authorId: string

  /** Dates */

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
