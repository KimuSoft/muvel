import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { EpisodeEntity } from "./episode.entity"
import { BlocksService } from "../blocks/blocks.service"
import { PatchBlocksDto } from "./dto/patch-blocks.dto"

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(EpisodeEntity)
    private episodesRepository: Repository<EpisodeEntity>,
    private blocksService: BlocksService
  ) {}

  async create(
    title: string,
    description = "",
    chapter = "",
    novelId?: string
  ) {
    let order = 1
    if (novelId) {
      const lastBlock = await this.episodesRepository
        .findOne({ where: { novelId }, order: { order: "DESC" } })
        .catch(() => ({ order: 0 }))
      order = lastBlock.order + 1
    }

    const episode = new EpisodeEntity()
    episode.title = title
    episode.description = description
    episode.chapter = chapter
    episode.order = order

    // 블록 생성
    episode.blocks = [await this.blocksService.create("샘플 블록입니다.")]

    return this.episodesRepository.save(episode)
  }

  async findOne(id: string, relations: string[] = []) {
    return this.episodesRepository.findOne({
      where: { id },
      relations,
    })
  }

  async deleteEpisode(id: string) {
    const episode = await this.findOne(id, ["blocks"])
    await this.episodesRepository.delete(id)
  }

  async patchBlocks(id: string, blockDiffs: PatchBlocksDto[]) {
    const episode = await this.findOne(id)

    await this.blocksService.upsert(
      blockDiffs
        .filter((b) => !b.isDeleted)
        .map((b) => ({
          id: b.id,
          content: b.content,
          blockType: b.blockType,
          order: b.order,
          episode,
        }))
    )

    for (const i of blockDiffs.filter((b) => b.isDeleted)) {
      console.log("삭제", i)
      await this.blocksService.delete(i.id)
    }
  }

  async update(
    id: string,
    chapter: string,
    title: string,
    description: string
  ) {
    const episode = await this.findOne(id)

    episode.chapter = chapter
    episode.title = title
    episode.description = description

    await this.episodesRepository.save(episode)
  }
}
