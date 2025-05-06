import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import { EpisodeEntity } from "../entities/episode.entity"
import { In, Repository } from "typeorm"
import { EpisodeSnapshotEntity } from "../entities/episode-snapshot.entity"
import { SnapshotReason } from "muvel-api-types"

@Injectable()
export class EpisodeSnapshotService {
  private readonly logger = new Logger(EpisodeSnapshotService.name)

  constructor(
    @InjectRepository(EpisodeEntity)
    private readonly episodeRepository: Repository<EpisodeEntity>,
    @InjectRepository(EpisodeSnapshotEntity)
    private readonly episodeSnapshotRepository: Repository<EpisodeSnapshotEntity>,
  ) {}

  async createSnapshot(
    episodeOrId: string | EpisodeEntity,
    { reason, save = true }: { reason?: SnapshotReason; save?: boolean },
  ) {
    const episode =
      typeof episodeOrId === "string"
        ? await this.episodeRepository.findOneOrFail({
            where: { id: episodeOrId },
            relations: ["blocks"],
          })
        : episodeOrId

    const snapshot = new EpisodeSnapshotEntity()
    snapshot.episode = episode
    snapshot.episodeId = episode.id
    if (reason) snapshot.reason = reason

    snapshot.blocks = episode.blocks.map((block) => ({
      ...block,
    }))

    if (save) {
      await this.episodeRepository.update(
        { id: episode.id },
        { isSnapshotted: true },
      )
      return this.episodeSnapshotRepository.save(snapshot)
    } else {
      return snapshot
    }
  }

  async findSnapshotsByEpisodeId(episodeId: string) {
    const episode = await this.episodeRepository.findOne({
      where: { id: episodeId },
      relations: ["snapshots"],
    })
    if (!episode) {
      throw new NotFoundException(`Episode with id ${episodeId} not found`)
    }

    return episode.snapshots
  }

  @Cron("*/10 * * * *") // 10분마다 실행
  async createSnapshotSchedule() {
    this.logger.log("Creating episode snapshots...")

    const episodes = await this.episodeRepository.find({
      where: { isSnapshotted: false },
      relations: ["blocks"],
    })

    const newSnapshots: EpisodeSnapshotEntity[] = []

    for (const episode of episodes) {
      // 블록이 없는 에피소드는 스냅샷을 만들지 않음
      if (!episode.blocks.length) continue

      // 블록이 있는 에피소드에 대해서만 스냅샷 생성
      const snapshot = await this.createSnapshot(episode, {
        reason: SnapshotReason.Autosave,
        save: false,
      })
      newSnapshots.push(snapshot)

      // 글자 수 캐싱
      const contentLength = episode.blocks.reduce(
        (acc, block) => acc + block.text.replace(/\s/g, "").length,
        0,
      )

      await this.episodeRepository.update({ id: episode.id }, { contentLength })
    }

    // Bulk insert snapshots
    await this.episodeSnapshotRepository.save(newSnapshots)
    await this.episodeRepository.update(
      { id: In(episodes.map((episode) => episode.id)) },
      { isSnapshotted: true },
    )

    this.logger.log(`Created ${newSnapshots.length} episode snapshots.`)
  }
}
