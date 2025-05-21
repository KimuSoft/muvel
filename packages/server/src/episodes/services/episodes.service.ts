import { ForbiddenException, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { PatchEpisodesDto } from "../../novels/dto/patch-episodes.dto"
import { CreateEpisodeDto } from "../dto/create-episode.dto"
import { NovelEntity } from "../../novels/novel.entity"
import { BasePermission, EpisodeType } from "muvel-api-types"
import { UpdateEpisodeDto } from "../dto/update-episode.dto"
import { EpisodeRepository } from "../repositories/episode.repository"
import { EpisodeBlockRepository } from "../../blocks/repositories/episode-block.repository"
import { EpisodeBlockSyncRepository } from "../../blocks/repositories/episode-block-sync.repository"
import { EpisodeDeltaBlockDto } from "../../blocks/dto/episode-delta-block.dto"

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(NovelEntity)
    private readonly novelsRepository: Repository<NovelEntity>,
    private readonly episodesRepository: EpisodeRepository,
    private readonly episodeBlockSyncRepository: EpisodeBlockSyncRepository,
    private readonly blockRepository: EpisodeBlockRepository,
  ) {}

  async findEpisodeById(id: string, permissions: BasePermission) {
    const episode = await this.episodesRepository.findOneOrFail({
      where: { id },
      relations: ["novel", "novel.author"],
    })

    return { ...episode, permissions }
  }

  async createEpisode(novelId: string, dto: CreateEpisodeDto) {
    const episode = await this.episodesRepository.createEpisode(novelId, dto)

    // 소설 총 회차 갱신
    await this.novelsRepository.update(
      { id: novelId },
      { episodeCount: Math.round(episode.order) },
    )

    return episode
  }

  async deleteEpisode(id: string) {
    const episode = await this.episodesRepository.findOneOrFail({
      where: { id },
    })

    if (episode.episodeType === EpisodeType.Episode) {
      // 에피소드 타입이 에피소드면 회차 수를 줄임
      await this.novelsRepository.update(
        { id: episode.novelId },
        { episodeCount: Math.round(episode.order) - 1 },
      )
    }

    return this.episodesRepository.delete(id)
  }

  async updateEpisode(id: string, dto: UpdateEpisodeDto) {
    return this.episodesRepository.update({ id }, dto)
  }

  async upsertEpisode(novelId: string, episodes: PatchEpisodesDto[]) {
    // 해당 소설의 에피소드가 맞는지 검증
    const novel = await this.novelsRepository.findOneOrFail({
      where: { id: novelId },
      relations: ["episodes"],
    })

    const episodeIdsSet = new Set(novel.episodes.map((episode) => episode.id))
    const invalidEpisodes = episodes.filter(
      (episode) => !episodeIdsSet.has(episode.id),
    )

    if (invalidEpisodes.length) {
      throw new ForbiddenException(
        `해당 소설(${novelId})의 에피소드가 아닙니다. ${invalidEpisodes
          .map((episode) => episode.id)
          .join(", ")}`,
      )
    }

    return this.episodesRepository.upsert(episodes, ["id"])
  }

  async findBlocksByEpisodeId(episodeId: string, permissions: BasePermission) {
    return this.blockRepository.findBlocksByEpisodeId(episodeId, {
      hideComments: !permissions.edit,
      simplify: true,
    })
  }

  public async episodeBlocksSync(
    episodeId: string,
    deltaBlocks: EpisodeDeltaBlockDto[],
  ) {
    await this.episodeBlockSyncRepository.syncDeltaBlocks(
      episodeId,
      deltaBlocks,
    )

    void this.episodesRepository.updateContentLength(episodeId)
  }
}
