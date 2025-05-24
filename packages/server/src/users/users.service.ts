import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "./user.entity"
import { Repository } from "typeorm"
import { NovelEntity } from "../novels/novel.entity"
import { Cron, CronExpression } from "@nestjs/schedule"
import { ShareType } from "muvel-api-types"

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name) // 클래스 이름 자동으로 사용

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(NovelEntity)
    private novelsRepository: Repository<NovelEntity>,
  ) {}

  async findUserById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ id })
  }

  // Public하게 불러오는 경우
  async findUserByIdPublic(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      select: ["id", "username", "avatar", "point"],
    })
  }

  async getUserCount() {
    return this.userRepository.count()
  }

  async getRecentNovels(userId: string): Promise<NovelEntity[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ["recentNovelIds"],
    })

    if (!user?.recentNovelIds?.length) return []

    let novels = await this.novelsRepository
      .createQueryBuilder("novel")
      .leftJoinAndSelect("novel.author", "author")
      .select([
        "novel.id",
        "novel.title",
        "novel.description",
        "novel.thumbnail",
        "novel.tags",
        "novel.episodeCount",
        "novel.share",
        "novel.createdAt",
        "novel.updatedAt",
        "author.id",
        "author.username",
      ])
      .where("novel.id IN (:...ids)", { ids: user.recentNovelIds })
      .getMany()

    // 내 소설 아닌데 (author.id가 자신이 아니고 비공개인 소설 삭제)
    novels = novels.filter((novel) => {
      const isMine = novel.author.id === userId
      const isPublic = [ShareType.Public, ShareType.Unlisted].includes(
        novel.share,
      )
      return isMine || isPublic
    })

    // 최근 본 순서대로 정렬 (Postgres IN은 순서 보장 안 함)
    return user.recentNovelIds
      .map((id) => novels.find((n) => n.id === id))
      .filter((n): n is NovelEntity => !!n)
      .slice(0, 10)
  }

  // users.service.ts
  async updateLastAccessedNovel(
    userId: string,
    novelId: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ["id", "recentNovelIds"],
    })

    if (!user) throw new NotFoundException("User not found")

    const recentList = user.recentNovelIds ?? []

    // novelId를 가장 앞으로 옮기고 중복 제거
    const updated = [novelId, ...recentList.filter((id) => id !== novelId)]

    // (선택) 최대 20개로 자르기
    const limited = updated.slice(0, 20)

    await this.userRepository.update(userId, {
      recentNovelIds: limited,
    })
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handlePointIncrease() {
    try {
      const result = await this.userRepository
        .createQueryBuilder()
        .update(UserEntity)
        .set({
          point: () => `LEAST(point + 50, 1000)`,
        })
        .where("point < 1000")
        .execute()

      this.logger.log(`✅ Updated ${result.affected} users' points.`)
    } catch (error) {
      this.logger.error("❌ Failed to update points", error.stack)
    }
  }
}
