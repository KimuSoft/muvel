import { Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { EpisodeEntity } from "./episode.entity"
import { PatchEpisodesDto } from "../novels/dto/patch-episodes.dto"
import { CreateEpisodeDto } from "./dto/create-episode.dto"
import { NovelEntity } from "../novels/novel.entity"
import { ISearchRepository } from "../search/isearch.repository"
import { SearchRepository } from "src/search/search.repository"

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(NovelEntity)
    private novelsRepository: Repository<NovelEntity>,
    @InjectRepository(EpisodeEntity)
    private episodesRepository: Repository<EpisodeEntity>,
    @Inject(SearchRepository)
    private readonly searchRepository: ISearchRepository
  ) {}

  private async getNextOrder(novelId?: string) {
    if (!novelId) return 1

    const lastBlock: { order: number }[] = await this.episodesRepository.query(
      'SELECT * FROM "episode" WHERE "novelId" = $1 ORDER BY "order" DESC LIMIT 1',
      [novelId]
    )
    return lastBlock?.[0].order + 1
  }

  async createEpisode(novelId: string, createEpisodeDto: CreateEpisodeDto) {
    const novel = await this.novelsRepository.findOne({
      where: { id: novelId },
      relations: ["episodes"],
    })
    if (!novel) return null

    const order = createEpisodeDto.order ?? (await this.getNextOrder(novelId))

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

  async patchEpisodes(id: string, episodesDiff: PatchEpisodesDto[]) {
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
}
