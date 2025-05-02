import { NovelEntity } from "src/novels/novel.entity"
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm"

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

  @Column({ type: "uuid", array: true, default: [] })
  recentNovelIds?: string[]

  @Column({ default: false })
  admin: boolean

  // 100 포인트 = 3000자
  @Column({ default: 1000 })
  point: number

  /** Dates */

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
