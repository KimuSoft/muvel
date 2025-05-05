import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm"
import { UserEntity } from "src/users/user.entity"

@Entity("google_drive_account")
export class GoogleDriveAccountEntity {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => UserEntity, (user) => user.googleDrive)
  @JoinColumn()
  user: UserEntity

  @Column()
  googleId: string

  @Column()
  email: string

  @Column()
  encryptedAccessToken: string

  @Column()
  encryptedRefreshToken: string

  @Column({ nullable: true })
  driveFolderId: string

  @Column({ type: "timestamp", nullable: true })
  accessTokenExpiresAt: Date
}
