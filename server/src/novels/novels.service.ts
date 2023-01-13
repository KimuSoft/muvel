import { Injectable } from "@nestjs/common"
import { User } from "../users/user.entity"
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

  async create(author: User, title: string, description: string) {
    const novel = new Novel()
    novel.title = title
    novel.description = description
    novel.author = author

    // 에피소드 생성
    novel.episodes = [
      await this.episodesService.create(
        novel,
        "시작하기",
        "뮤블의 사용법을 배워 보아요!"
      ),
    ]

    return this.novelsRepository.save(novel)
  }
}
