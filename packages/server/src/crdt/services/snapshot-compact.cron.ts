// src/crdt/services/snapshot-compact.cron.ts
import { Cron, CronExpression } from "@nestjs/schedule"
import { Injectable, Logger } from "@nestjs/common"
import { YDocService } from "./ydoc.service"
import { EpisodeRepository } from "../../episodes/repositories/episode.repository"

@Injectable()
export class SnapshotCompactCron {
  private readonly log = new Logger(SnapshotCompactCron.name)
  constructor(
    private readonly episodes: EpisodeRepository,
    private readonly ydoc: YDocService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async run() {
    const ids = (await this.episodes.find({ select: ["id"] })).map((e) => e.id)
    for (const id of ids) {
      try {
        await this.ydoc.compact(id)
      } catch (err) {
        this.log.warn(`compact failed for ${id}`, err as any)
      }
    }
  }
}
