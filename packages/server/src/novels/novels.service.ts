import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { NovelEntity } from "./novel.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { SearchNovelsDto } from "./dto/search-novels.dto"
import { UserEntity } from "../users/user.entity"
import { BlockType, NovelPermission, ShareType } from "../types"
import { UpdateNovelDto } from "./dto/update-novel.dto"
import { EpisodeEntity } from "../episodes/episode.entity"
import { BlockEntity } from "../blocks/block.entity"
import { CreateNovelDto } from "./dto/create-novel.dto"

@Injectable()
export class NovelsService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(NovelEntity)
    private novelsRepository: Repository<NovelEntity>,
    @InjectRepository(EpisodeEntity)
    private episodesRepository: Repository<EpisodeEntity>,
    @InjectRepository(BlockEntity)
    private blocksRepository: Repository<BlockEntity>
  ) {}

  async createNovel(authorId: string, createNovelDto: CreateNovelDto) {
    const user = await this.usersRepository.findOneBy({ id: authorId })
    const novel = new NovelEntity()

    novel.title = createNovelDto.title
    novel.description = createNovelDto.description
    novel.author = user
    novel.share = createNovelDto.share

    // 에피소드 생성
    novel.episodes = [
      await this.createInitialEpisode(
        "시작하기",
        "뮤블의 사용법을 배워 보아요!"
      ),
    ]

    return this.novelsRepository.save(novel)
  }

  async findNovelById(id: string, userId: string) {
    // 소설 정보 불러오기
    const novel = await this.novelsRepository.findOne({
      where: { id },
      relations: ["author", "episodes"],
    })
    if (!novel) throw new NotFoundException("소설을 찾을 수 없습니다.")

    // 소설이 비공개 이고 주인이 아닌 경우
    if (novel.share === ShareType.Private) {
      // 유저 정보 불러오기
      const user = await this.usersRepository.findOneBy({ id: userId })
      if (!user) throw new NotFoundException("유저를 찾을 수 없습니다.")

      if (novel.author.id !== userId) {
        throw new ForbiddenException("비공개 소설은 작성자만 볼 수 있습니다.")
      }
    }

    console.log(`소설 정보: ${JSON.stringify(novel)}`)
    return novel
  }

  private async createInitialEpisode(
    title: string,
    description = "",
    chapter = "",
    novelId?: string
  ) {
    let order = 1
    if (novelId) {
      const lastBlock: { order: string }[] =
        await this.episodesRepository.query(
          'SELECT * FROM "episode" WHERE "novelId" = $1 ORDER BY "order" DESC LIMIT 1',
          [novelId]
        )
      order = parseFloat(lastBlock?.[0].order) + 1
    }

    const episode = new EpisodeEntity()
    episode.title = title
    episode.description = description
    episode.chapter = chapter
    episode.order = order.toString()

    // 블록 생성
    episode.blocks = [await this.createBlock("샘플 블록입니다.")]

    return this.episodesRepository.save(episode)
  }

  private async createBlock(content: string, order?: number) {
    if (!order) {
      const lastBlock = await this.blocksRepository
        .findOne({
          order: { order: "DESC" },
        })
        .catch(() => ({ order: 0 }))
      order = lastBlock.order + 1
    }

    const block = new BlockEntity()
    block.blockType = BlockType.Describe
    block.content = content
    block.order = order

    return this.blocksRepository.save(block)
  }

  async delete(id: string) {
    return this.novelsRepository.softDelete({ id })
  }

  async updateNovel(id: string, updateNovelDto: UpdateNovelDto) {
    const novel = await this.findOne(id)

    if (!novel) return null

    novel.title = updateNovelDto.title ?? novel.title
    novel.description = updateNovelDto.description ?? novel.description
    novel.share = updateNovelDto.share ?? novel.share
    novel.thumbnail = updateNovelDto.thumbnail ?? novel.thumbnail
    novel.tags = updateNovelDto.tags ?? novel.tags
    novel.order = updateNovelDto.order ?? novel.order

    return this.novelsRepository.save(novel)
  }

  async findOne(id: string, relations: string[] = []) {
    if (!id) return null
    const novel = await this.novelsRepository.findOne({
      where: { id },
      relations,
    })

    if (!novel) {
      console.warn(`소설을 찾을 수 없습니다. id=${id}`)
      return novel
    }

    // 에피소드 정렬
    novel.episodes?.sort((a, b) => parseFloat(a.order) - parseFloat(b.order))
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
        "novel.thumbnail",
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

    if (!novel) throw new Error("소설을 찾을 수 없습니다. novelId=" + novelId)

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

  async getNovelByEpisodeId(episodeId: string) {
    return this.novelsRepository
      .createQueryBuilder("novel")
      .leftJoinAndSelect("novel.episodes", "episodes")
      .where("episodes.id = :episodeId", { episodeId })
      .getOne()
  }
}
