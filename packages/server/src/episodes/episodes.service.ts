import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindOptionsRelations, Repository } from "typeorm"
import { EpisodeEntity } from "./episode.entity"
import { PatchEpisodesDto } from "../novels/dto/patch-episodes.dto"
import { CreateEpisodeDto } from "./dto/create-episode.dto"
import { NovelEntity } from "../novels/novel.entity"
import { ISearchRepository } from "../search/isearch.repository"
import { SearchRepository } from "src/search/search.repository"
import { EpisodeType } from "../types"
import { UserEntity } from "../users/user.entity"

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(NovelEntity)
    private novelsRepository: Repository<NovelEntity>,
    @InjectRepository(EpisodeEntity)
    private episodesRepository: Repository<EpisodeEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @Inject(SearchRepository)
    private readonly searchRepository: ISearchRepository
  ) {}

  private async getNextOrder(
    episodeType: EpisodeType,
    novelId?: string
  ): Promise<string> {
    if (!novelId) return (1).toString()

    const lastBlock: { order: string }[] = await this.episodesRepository.query(
      'SELECT * FROM "episode" WHERE "novelId" = $1 ORDER BY "order" DESC LIMIT 1',
      [novelId]
    )
    return (
      episodeType === EpisodeType.Episode
        ? Math.floor(parseFloat(lastBlock?.[0].order)) + 1
        : parseFloat(lastBlock?.[0].order) + 1 / 10000
    ).toString()
  }

  async findEpisodeById(id: string, userId: string) {
    const episode = await this.episodesRepository.findOne({
      where: { id },
      relations: ["novel", "novel.author"],
    })

    if (!episode) throw new NotFoundException(`Episode with id ${id} not found`)

    // 유저 정보 불러오기
    const user = await this.usersRepository.findOneBy({ id: userId })

    return {
      ...episode,
      permissions: {
        canRead: true,
        canEdit: this.canEdit(episode.novel, user),
        canDelete: this.canEdit(episode.novel, user),
      },
    }
  }

  async createEpisode(novelId: string, createEpisodeDto: CreateEpisodeDto) {
    const novel = await this.novelsRepository.findOne({
      where: { id: novelId },
      relations: ["episodes"],
    })
    if (!novel) return null

    const order =
      createEpisodeDto.order ??
      (await this.getNextOrder(createEpisodeDto.episodeType, novelId))

    const episode = new EpisodeEntity()
    episode.title = createEpisodeDto.title
    episode.description = createEpisodeDto.description
    episode.episodeType = createEpisodeDto.episodeType
    episode.order = order
    await this.episodesRepository.save(episode)

    novel.episodes.push(episode)
    await this.novelsRepository.save(novel)

    return episode
  }

  async patchEpisodes(_id: string, episodesDiff: PatchEpisodesDto[]) {
    await this.upsert(episodesDiff)
  }

  async findOne(id: string, relations: string[] = []) {
    return this.episodesRepository.findOne({
      where: { id },
      relations,
    })
  }

  async deleteEpisode(id: string) {
    await this.findOne(id, ["blocks"])
    return this.episodesRepository.delete(id)
  }

  async updateEpisode(
    id: string,
    chapter: string,
    title: string,
    description: string
  ): Promise<EpisodeEntity> {
    const episode = await this.findOne(id)

    episode.chapter = chapter
    episode.title = title
    episode.description = description

    return this.episodesRepository.save(episode)
  }

  async upsert(episodes: PatchEpisodesDto[]) {
    return this.episodesRepository.upsert(episodes, ["id"])
  }

  async insertAllBlocksToCache() {
    const episodes = await this.episodesRepository
      .createQueryBuilder("episode")
      .leftJoinAndSelect("episode.blocks", "block")
      .getMany()

    const blocks = []

    for (const episode of episodes) {
      for (const block of episode.blocks) {
        blocks.push({
          id: block.id,
          content: block.content,
          blockType: block.blockType,
          order: block.order,
          episodeId: episode.id,
          episodeName: episode.title,
          episodeNumber: episode.order,
          index: block.order,
          novelId: episode.novelId,
        })
      }
    }

    return this.searchRepository.insertBlocks(blocks)
  }

  canEdit(novel: NovelEntity, user: UserEntity): boolean {
    return novel.author.id === user.id || user.admin
  }
}
