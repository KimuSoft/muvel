import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { PatchEpisodesDto } from "../../novels/dto/patch-episodes.dto"
import { CreateEpisodeDto } from "../dto/create-episode.dto"
import { NovelEntity } from "../../novels/novel.entity"
import { SearchRepository } from "src/search/search.repository"
import { BasePermission, EpisodeType } from "muvel-api-types"
import { UpdateEpisodeDto } from "../dto/update-episode.dto"
import { PatchBlocksDto } from "../dto/patch-blocks.dto"
import { BlockRepository } from "../../blocks/block.repository"
import { EpisodeRepository } from "../repositories/episode.repository"

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(NovelEntity)
    private readonly novelsRepository: Repository<NovelEntity>,
    private readonly episodesRepository: EpisodeRepository,
    private readonly blocksRepository: BlockRepository,
    private readonly searchRepository: SearchRepository,
  ) {}

  async findEpisodeById(id: string, permissions: BasePermission) {
    const episode = await this.episodesRepository.findOne({
      where: { id },
      relations: ["novel", "novel.author", "blocks"],
    })

    if (!episode) throw new NotFoundException(`Episode with id ${id} not found`)

    // edit 권한이 없다면 주석 블록을 없앰
    if (!permissions.edit) {
      console.log("주석 삭제!")
      episode.blocks = episode.blocks.filter(
        (block) => block.blockType !== "comment",
      )
    }

    return {
      ...episode,
      permissions,
    }
  }

  async createEpisode(novelId: string, dto: CreateEpisodeDto) {
    const episode = await this.episodesRepository.createEpisode(novelId, dto)

    // 소설 총 회차 갱신
    await this.novelsRepository.update(
      { id: novelId },
      { episodeCount: Math.round(parseFloat(episode.order)) },
    )

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
    const episode = await this.findOne(id, ["novel"])
    if (!episode) throw new NotFoundException(`Episode with id ${id} not found`)

    if (episode.episodeType === EpisodeType.Episode) {
      // 에피소드 타입이 에피소드면 회차 수를 줄임
      await this.novelsRepository.update(
        { id: episode.novelId },
        { episodeCount: Math.round(parseFloat(episode.order)) - 1 },
      )
    }

    return this.episodesRepository.delete(id)
  }

  async updateEpisode(id: string, dto: UpdateEpisodeDto) {
    return this.episodesRepository.update({ id }, dto)
  }

  async upsert(episodes: PatchEpisodesDto[]) {
    return this.episodesRepository.upsert(episodes, ["id"])
  }

  async updateBlocks(episodeId: string, blockDiffs: PatchBlocksDto[]) {
    const episode = await this.episodesRepository.findOneBy({ id: episodeId })
    if (!episode) return null

    // 블록 id 중복 있는지 확인하고 있으면 throw 401
    const blockIds = blockDiffs.map((b) => b.id)
    const uniqueBlockIds = new Set(blockIds)
    if (blockIds.length !== uniqueBlockIds.size) {
      console.warn(
        `중복된 블록 ID가 있습니다. episodeId=${episodeId}, blockIds=${blockIds}`,
      )
      console.warn(blockDiffs)
      throw new BadRequestException("중복된 블록 ID가 있습니다.")
    }

    const createdOrUpdatedBlocks = blockDiffs.filter((b) => !b.isDeleted)
    const deletedBlockIds = blockDiffs
      .filter((b) => b.isDeleted)
      .map((b) => b.id)

    // 변경사항 meilisearch 저장
    void this.searchRepository.insertBlocks(
      createdOrUpdatedBlocks.map((b) => ({
        id: b.id,
        content: b.content.map((c) => c.text).join(),
        blockType: b.blockType,
        order: b.order,
        episodeId: episodeId,
        episodeName: episode.title,
        episodeNumber: parseFloat(episode.order),
        index: b.order,
        novelId: episode.novelId,
      })),
    )

    void this.searchRepository.deleteBlocks(deletedBlockIds)

    if (deletedBlockIds.length > 0) {
      await this.blocksRepository.delete(deletedBlockIds)
      console.info(`블록 ${deletedBlockIds.length}개 삭제됨`)
    }

    await this.blocksRepository.upsert(
      createdOrUpdatedBlocks
        .filter((b) => !b.isDeleted)
        .map((b) => ({
          id: b.id,
          content: b.content,
          text: b.content.map((c) => c.text).join(),
          blockType: b.blockType,
          order: b.order,
          episode,
        })),
      ["id"],
    )

    await this.episodesRepository.update(
      { id: episodeId },
      { isSnapshotted: false },
    )
    console.info(`블록 ${createdOrUpdatedBlocks.length}개 생성/수정됨`)
  }
}
