import { Injectable, NotFoundException } from "@nestjs/common"
import { NovelEntity } from "../novel.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { SearchNovelsDto } from "../dto/search-novels.dto"
import { UserEntity } from "../../users/user.entity"
import { BasePermission, ShareType } from "muvel-api-types"
import { UpdateNovelDto } from "../dto/update-novel.dto"
import { CreateNovelDto } from "../dto/create-novel.dto"
import { EpisodeRepository } from "../../episodes/repositories/episode.repository"

@Injectable()
export class NovelsService {
  constructor(
    @InjectRepository(NovelEntity)
    private readonly novelsRepository: Repository<NovelEntity>,
    private readonly episodesRepository: EpisodeRepository,
  ) {}

  public async createNovel(
    user: { id: string },
    createNovelDto: CreateNovelDto,
  ) {
    const novel = new NovelEntity()

    novel.title = createNovelDto.title
    novel.description = createNovelDto.description
    // typeorm 릴레이션에서는 {id: string} 값만 있어도 릴레이션이 되므로 assertion
    novel.author = user as UserEntity
    novel.share = createNovelDto.share

    // 에피소드 생성
    novel.episodes = [await this.episodesRepository.createInitialEpisode()]

    return this.novelsRepository.save(novel)
  }

  public async findNovelById(id: string, permissions: BasePermission) {
    // 소설 정보 불러오기
    const novel = await this.novelsRepository.findOne({
      where: { id },
      relations: ["author", "episodes", "wikiPages"],
    })
    if (!novel) throw new NotFoundException("소설을 찾을 수 없습니다.")

    novel.episodes.sort((a, b) => a.order - b.order)

    return {
      ...novel,
      permissions,
    }
  }

  public async delete(id: string) {
    return this.novelsRepository.softDelete({ id })
  }

  async updateNovel(id: string, updateNovelDto: UpdateNovelDto) {
    const novel = await this.novelsRepository.findOneBy({ id })
    if (!novel) return null

    novel.title = updateNovelDto.title ?? novel.title
    novel.description = updateNovelDto.description ?? novel.description
    novel.share = updateNovelDto.share ?? novel.share
    novel.thumbnail = updateNovelDto.thumbnail ?? novel.thumbnail
    novel.tags = updateNovelDto.tags ?? novel.tags
    novel.order = updateNovelDto.order ?? novel.order

    return this.novelsRepository.save(novel)
  }

  async exportNovel(id: string) {
    const novel = await this.novelsRepository.findOne({
      where: { id },
      relations: ["author", "episodes", "episodes.blocks"],
    })
    if (!novel) throw new NotFoundException()

    return novel
  }

  async searchNovel(searchNovelsDto: SearchNovelsDto) {
    let query = this.novelsRepository
      .createQueryBuilder("novel")
      .where(`novel.share = ${ShareType.Public}`)
      .leftJoinAndSelect("novel.author", "author")

    if (searchNovelsDto.author) {
      query = query.where("author.username LIKE :name", {
        name: `%${searchNovelsDto.author}%`,
      })
    }

    if (searchNovelsDto.title) {
      query = query.where("novel.title LIKE :title", {
        title: `%${searchNovelsDto.title}%`,
      })
    }

    console.debug(query.getSql())
    return query
      .select([
        "novel.id",
        "novel.title",
        "novel.description",
        "novel.authorId",
        "novel.createdAt",
        "novel.updatedAt",
        "novel.thumbnail",
        "author.username",
        "author.id",
        "author.avatar",
      ])
      .offset(searchNovelsDto.start)
      .take(searchNovelsDto.display)
      .getMany()
  }

  public async findNovelsByUserId(id: string, showAll: boolean) {
    return this.novelsRepository.find({
      where: {
        author: { id },
        ...(showAll ? {} : { share: ShareType.Public }),
      },
      relations: ["author"],
    })
  }
}
