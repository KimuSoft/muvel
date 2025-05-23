import { GoogleDriveAccountEntity } from "src/google-drive/google-drive-account.entity"
import { NovelEntity } from "src/novels/novel.entity"
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  RelationId,
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

  @Column({ default: false })
  admin: boolean

  // 100 포인트 = 3000자
  @Column({ default: 1000 })
  point: number

  /** Caches */

  @Column({ type: "uuid", array: true, default: [], select: false })
  recentNovelIds?: string[]

  /** Relations */

  @OneToMany(() => NovelEntity, (novel) => novel.author, {
    cascade: true,
  })
  novels: NovelEntity[]

  @OneToOne(() => GoogleDriveAccountEntity, (g) => g.user, {
    cascade: true,
    nullable: true,
  })
  googleDrive?: GoogleDriveAccountEntity

  @RelationId((user: UserEntity) => user.googleDrive)
  googleDriveId?: number

  /** Dates */

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date
}
