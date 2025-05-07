// src/google-drive/google-drive.service.ts

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common"
import { drive_v3, google } from "googleapis"
import { createCipheriv, createDecipheriv, randomBytes } from "crypto"
import { Repository } from "typeorm"
import { UserEntity } from "../../users/user.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { GoogleDriveAccountEntity } from "../google-drive-account.entity"

@Injectable()
export class GoogleDriveService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  private readonly algorithm = "aes-256-cbc"
  private readonly key = Buffer.from(process.env.GOOGLE_ENCRYPTION_KEY!, "hex") // 32 bytes key

  private encrypt(text: string): string {
    const iv = randomBytes(16)
    const cipher = createCipheriv(this.algorithm, this.key, iv)
    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ])
    return iv.toString("hex") + ":" + encrypted.toString("hex")
  }

  private decrypt(encrypted: string): string {
    const [ivHex, encryptedText] = encrypted.split(":")
    const iv = Buffer.from(ivHex, "hex")
    const decipher = createDecipheriv(this.algorithm, this.key, iv)
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedText, "hex")),
      decipher.final(),
    ])
    return decrypted.toString("utf8")
  }

  async handleGoogleLogin({
    accessToken,
    refreshToken,
    profile,
    userId,
  }: {
    accessToken: string
    refreshToken: string
    profile: any
    userId: string
  }) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["googleDrive"],
    })

    if (!user) {
      throw new UnauthorizedException("User not found")
    }

    if (!accessToken || !refreshToken || !profile?.id) {
      throw new BadRequestException("Missing required Google login data")
    }

    const encryptedAccessToken = this.encrypt(accessToken)
    const encryptedRefreshToken = this.encrypt(refreshToken)

    const googleDriveAccount = new GoogleDriveAccountEntity()
    googleDriveAccount.googleId = profile.id
    googleDriveAccount.email = profile.emails?.[0]?.value || ""
    googleDriveAccount.encryptedAccessToken = encryptedAccessToken
    googleDriveAccount.encryptedRefreshToken = encryptedRefreshToken
    googleDriveAccount.accessTokenExpiresAt = new Date(
      Date.now() + 60 * 60 * 1000,
    ) // 1 hour expiry

    user.googleDrive = googleDriveAccount
    await this.userRepository.save(user)
  }

  private async getDriveClient(userId: string): Promise<drive_v3.Drive> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["googleDrive"],
    })

    if (!user || !user.googleDrive) {
      throw new UnauthorizedException("Google Drive not connected")
    }

    const accessToken = this.decrypt(user.googleDrive.encryptedAccessToken)
    const refreshToken = this.decrypt(user.googleDrive.encryptedRefreshToken)

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL,
    )

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    let refreshed = false

    try {
      // 임의 API 호출로 토큰 유효성 확인
      await google
        .drive({ version: "v3", auth: oauth2Client })
        .files.list({ pageSize: 1 })
    } catch (err) {
      if (err.response?.status === 401) {
        // access_token 만료 → refresh
        const { credentials } = await oauth2Client.refreshAccessToken()
        const newAccessToken = credentials.access_token

        if (!newAccessToken) {
          throw new UnauthorizedException("Access token not set")
        }

        user.googleDrive.encryptedAccessToken = this.encrypt(newAccessToken)
        user.googleDrive.accessTokenExpiresAt = new Date(
          Date.now() + 1000 * 60 * 60,
        ) // 1 hour

        await this.userRepository.save(user)
        oauth2Client.setCredentials({
          access_token: newAccessToken,
          refresh_token: refreshToken,
        })

        refreshed = true
      } else {
        throw err
      }
    }

    if (refreshed) {
      console.log(`[Drive] Access token refreshed for user ${userId}`)
    }

    return google.drive({ version: "v3", auth: oauth2Client })
  }

  async getOrCreateFolder(
    drive: drive_v3.Drive,
    parentId: string | null,
    name: string,
  ): Promise<string> {
    const q = `'${parentId ?? "root"}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`

    const res = await drive.files.list({
      q,
      fields: "files(id)",
      spaces: "drive",
    })
    if (res.data.files?.[0]) {
      if (!res.data.files[0].id) {
        throw new InternalServerErrorException("Folder ID not found")
      }
      return res.data.files[0].id
    }

    const newFolder = await drive.files.create({
      requestBody: {
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentId ? [parentId] : undefined,
      },
      fields: "id",
    })

    return newFolder.data.id!
  }

  private async uploadOrUpdateFile(
    drive: drive_v3.Drive,
    folderId: string,
    filename: string,
    mimeType: string,
    content: Buffer,
  ): Promise<void> {
    const q = `'${folderId}' in parents and name='${filename}' and trashed=false`
    const existing = await drive.files.list({ q, fields: "files(id)" })

    if (existing.data.files?.[0]) {
      await drive.files.update({
        fileId: existing.data.files[0].id!,
        media: { mimeType, body: content },
      })
    } else {
      await drive.files.create({
        requestBody: {
          name: filename,
          mimeType,
          parents: [folderId],
        },
        media: { mimeType, body: content },
      })
    }
  }

  async backupEpisodesOnly(userId: string): Promise<void> {
    const drive = await this.getDriveClient(userId)
    const muvelFolderId = await this.getOrCreateFolder(drive, null, "muvel")

    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      relations: ["novels", "novels.episodes"],
    })

    for (const novel of user.novels) {
      // TODO 애초에 쿼리 단계부터 isDriveBackup이 false인 것만 가져오도록 수정
      const episodesToBackup = novel.episodes.filter((e) => !e.isDriveBackup)
      if (!episodesToBackup.length) continue

      const novelFolderId = await this.getOrCreateFolder(
        drive,
        muvelFolderId,
        novel.id,
      )
      const episodesFolderId = await this.getOrCreateFolder(
        drive,
        novelFolderId,
        "episodes",
      )

      for (const episode of episodesToBackup) {
        const episodeFolderId = await this.getOrCreateFolder(
          drive,
          episodesFolderId,
          episode.id,
        )

        // episode.json 저장
        await this.uploadOrUpdateFile(
          drive,
          episodeFolderId,
          "episode.json",
          "application/json",
          Buffer.from(JSON.stringify(episode, null, 2), "utf8"),
        )

        // TODO: episode.md 저장 (향후 작성)
        // const markdown = serializeEpisodeToMarkdown(episode);
        // await this.uploadOrUpdateFile(...);

        // 백업 완료 표시
        episode.isDriveBackup = true
      }
    }

    // DB에 백업 완료 저장
    await this.userRepository.save(user)
  }
}
