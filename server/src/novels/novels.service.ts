import { Injectable } from "@nestjs/common"
import { NovelEntity } from "./novel.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { EpisodesService } from "../episodes/episodes.service"
import { SearchNovelsDto } from "./dto/search-novels.dto"
import { UserEntity } from "../users/user.entity"
import { NovelPermission, ShareType } from "../types"
import { PatchEpisodesDto } from "./dto/patch-episodes.dto"

@Injectable()
export class NovelsService {
  constructor(
    @InjectRepository(NovelEntity)
    private novelsRepository: Repository<NovelEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private episodesService: EpisodesService
  ) {}

  async create(
    authorId: string,
    title: string,
    description: string,
    share?: ShareType
  ) {
    const user = await this.usersRepository.findOneBy({ id: authorId })
    const novel = new NovelEntity()
    novel.title = title || ""
    novel.description = description || ""
    novel.author = user
    novel.share = share || ShareType.Private

    // 에피소드 생성
    novel.episodes = [
      await this.episodesService.create(
        "시작하기",
        "뮤블의 사용법을 배워 보아요!"
      ),
    ]

    return this.novelsRepository.save(novel)
  }

  async update(
    id: string,
    title: string,
    description: string,
    share: ShareType
  ) {
    const novel = await this.findOne(id)
    novel.title = title
    novel.description = description
    novel.share = share
    return this.novelsRepository.save(novel)
  }

  async addEpisode(
    novelId: string,
    title: string,
    description: string,
    chapter: string
  ) {
    const novel = await this.findOne(novelId, ["episodes"])
    const episode = await this.episodesService.create(
      title,
      description,
      chapter,
      novelId
    )
    novel.episodes.push(episode)
    await this.novelsRepository.save(novel)
    return episode
  }

  async findOne(id: string, relations: string[] = []) {
    const novel = await this.novelsRepository.findOne({
      where: { id },
      relations,
    })

    if (!novel) {
      console.warn(`소설을 찾을 수 없습니다. id=${id}`)
      return novel
    }

    // 에피소드 정렬
    novel.episodes?.sort((a, b) => a.order - b.order)
    return novel
  }

  async search(searchNovelsDto: SearchNovelsDto) {
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
        "author.username",
        "author.id",
        "author.avatar",
      ])
      .offset(searchNovelsDto.start)
      .take(searchNovelsDto.display)
      .getMany()
  }

  async getPermission(novelId: string, userId?: string) {
    const novel = await this.novelsRepository.findOne({
      where: { id: novelId },
      relations: ["author"],
    })

    if (userId && novel.author.id === userId) {
      return [
        NovelPermission.Author,
        NovelPermission.ReadNovel,
        NovelPermission.EditNovel,
        NovelPermission.CreateNovel,
        NovelPermission.DeleteNovel,
        NovelPermission.ReadNovelComments,
      ]
    } else {
      if (novel.share === ShareType.Private) return []
      else return [NovelPermission.ReadNovel]
    }
  }

  async uploadThumbnail(novelId: string, thumbnail: Express.Multer.File) {}

  async patchEpisodes(id: string, episodesDiff: PatchEpisodesDto[]) {
    const episode = await this.findOne(id)

    await this.episodesService.upsert(episodesDiff)

    // for (const i of episodesDiff.filter((b) => b.isDeleted)) {
    //   console.log("삭제", i)
    //   await this.episodesService.delete(i.id)
    // }
  }

  async getNovelByEpisodeId(episodeId: string) {
    return this.novelsRepository
      .createQueryBuilder("novel")
      .leftJoinAndSelect("novel.episodes", "episodes")
      .where("episodes.id = :episodeId", { episodeId })
      .getOne()
  }
}
