import { Module } from "@nestjs/common"
import { GoogleDriveService } from "./google-drive.service"
import { GoogleDriveStrategy } from "./google-drive.strategy"
import { GoogleDriveController } from "./google-drive.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { GoogleDriveAccountEntity } from "./google-drive-account.entity"
import { UserEntity } from "src/users/user.entity"
import { DriveBackupService } from "./drive-backup.service"

@Module({
  imports: [TypeOrmModule.forFeature([GoogleDriveAccountEntity, UserEntity])],
  providers: [GoogleDriveService, GoogleDriveStrategy, DriveBackupService],
  controllers: [GoogleDriveController],
})
export class GoogleDriveModule {}
