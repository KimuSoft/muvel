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

    snapshot.blocks = episode.blocks
      .map((block) => ({
        ...block,
      }))
      .sort((a, b) => a.order - b.order)

    if (save) {
      return this.episodeSnapshotRepository.save(snapshot)
    } else {
      return snapshot
    }
  }

  async findSnapshotsByEpisodeId(episodeId: string) {
    const episode = await this.episodeRepository.findOneOrFail({
      where: { id: episodeId },
      relations: ["snapshots"],
    })

    for (const snapshot of episode.snapshots) {
      snapshot.blocks.sort((a, b) => a.order - b.order)
    }

    return episode.snapshots
  }
}
