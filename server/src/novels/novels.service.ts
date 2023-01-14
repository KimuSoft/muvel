import { Injectable } from "@nestjs/common"
import { Novel } from "./novel.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { EpisodesService } from "../episodes/episodes.service"

@Injectable()
export class NovelsService {
  constructor(
    @InjectRepository(Novel)
    private novelsRepository: Repository<Novel>,
    private episodesService: EpisodesService
  ) {}

  async create(title: string, description: string) {
    const novel = new Novel()
    novel.title = title
    novel.description = description

    // 에피소드 생성
    novel.episodes = [
      await this.episodesService.create(
        "시작하기",
        "뮤블의 사용법을 배워 보아요!"
      ),
    ]

    return this.novelsRepository.save(novel)
  }

  async addEpisode(novelId: string, title: string, description: string) {
    const novel = await this.findOne(novelId, ["episodes"])
    const episode = await this.episodesService.create(title, description)
    novel.episodes.push(episode)
    await this.novelsRepository.save(novel)
    return episode
  }

  async findOne(id: string, relations: string[] = []) {
    return this.novelsRepository.findOne({
      where: { id },
      relations,
    })
  }
}
