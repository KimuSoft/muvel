import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Novel } from "../novels/novel.entity"
import { Repository } from "typeorm"
import { Episode } from "./episode.entity"

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(Episode)
    private episodesRepository: Repository<Episode>
  ) {}

  async create(novel: Novel, title: string, description: string) {
    const episode = new Episode()
    episode.title = title
    episode.description = description
    episode.novel = novel

    // 블록 생성

    return this.episodesRepository.save(episode)
  }
}
