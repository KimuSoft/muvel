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

  async create(novel: Novel, title: string, description: string) {
    const episode = new Episode()
    episode.title = title
    episode.description = description
    episode.novel = novel

    // 블록 생성
    await this.blocksService.create(episode, "샘플 블록입니다.")

    return this.episodesRepository.save(episode)
  }
}
