import { Injectable } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import { EpisodeEntity } from "./episode.entity"
import { Repository } from "typeorm"
import { EpisodeSnapshotEntity } from "./episode-snapshot.entity"

@Injectable()
export class SnapshotService {
  constructor(
    @InjectRepository(EpisodeEntity)
    private readonly episodeRepository: Repository<EpisodeEntity>,
    @InjectRepository(EpisodeSnapshotEntity)
    private readonly episodeSnapshotRepository: Repository<EpisodeSnapshotEntity>
  ) {}

  @Cron("*/10 * * * *") // 10분마다 실행
  async createSnapshots() {
    console.info("Creating episode snapshots...")

    const episodes = await this.episodeRepository.find({
      where: { isSnapshotted: false },
      relations: ["blocks"],
    })

    for (const episode of episodes) {
      await this.episodeSnapshotRepository.save({
        episodeId: episode.id,
        blocks: episode.blocks,
      })

      episode.isSnapshotted = true
      await this.episodeRepository.save(episode)
    }
  }
}
