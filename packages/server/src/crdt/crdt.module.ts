/**
 * CrdtModule
 *  - Yjs 스냅샷/업데이트 저장소 & API 레이어
 *  - dev 모드: Bull, Redis 없이 in‑memory 로 작동
 */
import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ScheduleModule } from "@nestjs/schedule"
import { YSnapshotEntity } from "./entities/y-snapshot.entity"
import { YUpdateEntity } from "./entities/y-update.entity"
import { YSnapshotRepository } from "./repositories/y-snapshot.repository"
import { YUpdateRepository } from "./repositories/y-update.repository"
import { YDocService } from "./services/ydoc.service"
import { YGateway } from "./gateways/y.gateway"
import { SyncController } from "./controllers/sync.controller"
import { SnapshotCompactCron } from "./services/snapshot-compact.cron"
import { EpisodeRepository } from "../episodes/repositories/episode.repository"
import { EpisodeEntity } from "../episodes/entities/episode.entity"
import { EpisodePermissionService } from "../episodes/services/episode-permission.service"
import { BlockEntity } from "../blocks/block.entity"
import { BlockRepository } from "../blocks/block.repository"
import { SearchRepository } from "../search/search.repository"

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      YSnapshotEntity,
      YUpdateEntity,
      EpisodeEntity,
      BlockEntity,
    ]),
    ScheduleModule.forRoot(),
  ],
  providers: [
    YSnapshotRepository,
    YUpdateRepository,
    YDocService,
    YGateway,
    SnapshotCompactCron,
    EpisodeRepository,
    EpisodePermissionService,
    BlockRepository,
    SearchRepository,
  ],
  controllers: [SyncController],
  exports: [YDocService],
})
export class CrdtModule {}
