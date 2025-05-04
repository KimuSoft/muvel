import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { GoogleDriveAccountEntity } from "./google-drive-account.entity"
import { GoogleDriveService } from "./google-drive.service"

@Injectable()
export class DriveBackupService {
  private readonly logger = new Logger(DriveBackupService.name)

  constructor(
    @InjectRepository(GoogleDriveAccountEntity)
    private readonly driveAccountRepo: Repository<GoogleDriveAccountEntity>,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  /**
   * 매 시간 정각마다 모든 유저의 Google Drive에 에피소드 백업
   */
  @Cron("0 * * * *") // 매시 정각
  async handleBackup() {
    this.logger.log("🔁 Google Drive 백업 시작")

    const accounts = await this.driveAccountRepo.find({
      relations: ["user"],
    })

    for (const account of accounts) {
      const userId = account.user.id
      try {
        await this.googleDriveService.backupEpisodesOnly(userId)
        this.logger.log(`✅ 백업 완료: ${account.email}`)
      } catch (error) {
        this.logger.warn(`⚠️ 백업 실패: ${account.email} (${error.message})`)
      }
    }

    this.logger.log("✅ 모든 계정 백업 종료")
  }
}
