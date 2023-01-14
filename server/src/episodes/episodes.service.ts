import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Novel } from "../novels/novel.entity"
import { Repository } from "typeorm"
import { Episode } from "./episode.entity"
import { BlocksService } from "../blocks/blocks.service"

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(Episode)
    private episodesRepository: Repository<Episode>,
    private blocksService: BlocksService
  ) {}

  async create(title: string, description: string = "", chapter: string = "") {
    const episode = new Episode()
    episode.title = title
    episode.description = description
    episode.chapter = chapter

    // 블록 생성
    episode.blocks = [await this.blocksService.create("샘플 블록입니다.")]

    return this.episodesRepository.save(episode)
  }

  async findOne(id: number, relations: string[] = []) {
    return this.episodesRepository.findOne({
      where: { id },
      relations,
    })
  }
}
