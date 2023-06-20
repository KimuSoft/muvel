import { NovelEntity } from "src/novels/novel.entity"
import { Column, Entity, OneToMany, PrimaryColumn, RelationId } from "typeorm"

@Entity("user")
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

  @RelationId((self: UserEntity) => self.novels)
  novelIds: string[]

  @Column()
  recentEpisodeId: string

  @Column({ default: false })
  admin: boolean
}
