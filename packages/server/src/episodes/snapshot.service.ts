import { Injectable } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import { EpisodeEntity } from "./episode.entity"
import { In, Repository } from "typeorm"
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

    const newSnapshots: EpisodeSnapshotEntity[] = []

    for (const episode of episodes) {
      if (!episode.blocks.length) continue

      const snapshot = new EpisodeSnapshotEntity()
      snapshot.episode = episode
      snapshot.episodeId = episode.id
      snapshot.blocks = episode.blocks.map((block) => ({
        ...block,
      }))

      newSnapshots.push(snapshot)
    }

    await this.episodeSnapshotRepository.save(newSnapshots)
    await this.episodeRepository.update(
      { id: In(episodes.map((episode) => episode.id)) },
      { isSnapshotted: true }
    )

    console.info(`Created ${newSnapshots.length} episode snapshots.`)
  }
}
