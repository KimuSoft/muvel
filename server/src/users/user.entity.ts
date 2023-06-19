import { NovelEntity } from "src/novels/novel.entity"
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm"

@Entity()
export class UserEntity {
  @PrimaryColumn()
  id: string

  @Column()
  username: string

  @Column()
  avatar: string

  @OneToMany(() => NovelEntity, (novel) => novel.author, {
    cascade: true,
  })
  novels: NovelEntity[]

  @Column()
  recentEpisodeId: string

  @Column({ default: false })
  admin: boolean
}
