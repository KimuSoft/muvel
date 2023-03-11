import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Novel } from "../novels/novel.entity"
import { Repository } from "typeorm"
import { Episode } from "./episode.entity"
import { BlocksService } from "../blocks/blocks.service"
import { BlockType } from "../types"

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(Episode)
    private episodesRepository: Repository<Episode>,
    private blocksService: BlocksService
  ) {}

  async create(title: string, description = "", chapter = "") {
    const episode = new Episode()
    episode.title = title
    episode.description = description
    episode.chapter = chapter

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

  async update(
    id: string,
    chapter: string,
    title: string,
    description: string,
    blocksChange: {
      id: string
      content: string
      blockType: BlockType
      isDeleted: boolean
      order: number
    }[]
  ) {
    // console.log(blocksChange)
    const episode = await this.findOne(id)

    episode.chapter = chapter
    episode.title = title
    episode.description = description

    await this.episodesRepository.save(episode)

    if (!blocksChange) return
    await this.blocksService.upsert(
      blocksChange
        .filter((b) => !b.isDeleted)
        .map((b) => ({
          id: b.id,
          content: b.content,
          blockType: b.blockType,
          order: b.order,
          episode,
        }))
    )

    for (const i of blocksChange.filter((b) => b.isDeleted)) {
      console.log("삭제", i)
      await this.blocksService.delete(i.id)
    }
  }
}
