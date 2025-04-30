import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "./user.entity"
import { In, Repository } from "typeorm"
import { NovelEntity } from "../novels/novel.entity"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(NovelEntity)
    private novelsRepository: Repository<NovelEntity>
  ) {}

  async findUserById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({ id })
  }

  async getUserCount() {
    return this.usersRepository.count()
  }

  async getRecentNovels(userId: string): Promise<NovelEntity[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ["recentNovelIds"],
    })

    if (!user?.recentNovelIds?.length) return []

    const novels = await this.novelsRepository
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

    // 최근 본 순서대로 정렬 (Postgres IN은 순서 보장 안 함)
    return user.recentNovelIds
      .map((id) => novels.find((n) => n.id === id))
      .filter((n): n is NovelEntity => !!n)
      .slice(0, 10)
  }

  // users.service.ts
  async updateLastAccessedNovel(
    userId: string,
    novelId: string
  ): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ["id", "recentNovelIds"],
    })

    if (!user) throw new NotFoundException("User not found")

    const recentList = user.recentNovelIds ?? []

    // novelId를 가장 앞으로 옮기고 중복 제거
    const updated = [novelId, ...recentList.filter((id) => id !== novelId)]

    // (선택) 최대 20개로 자르기
    const limited = updated.slice(0, 20)

    await this.usersRepository.update(userId, {
      recentNovelIds: limited,
    })
  }
}
