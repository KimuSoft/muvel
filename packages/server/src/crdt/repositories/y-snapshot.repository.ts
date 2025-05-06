// src/crdt/repositories/y-snapshot.repository.ts
import { Injectable } from "@nestjs/common"
import { DataSource, Repository } from "typeorm"
import { YSnapshotEntity } from "../entities/y-snapshot.entity"

@Injectable()
export class YSnapshotRepository extends Repository<YSnapshotEntity> {
  constructor(dataSource: DataSource) {
    super(YSnapshotEntity, dataSource.createEntityManager())
  }

  /** 회차별 최신 스냅샷 반환 (없으면 null) */
  async getByEpisodeId(episodeId: string): Promise<YSnapshotEntity | null> {
    return this.findOne({ where: { episodeId } })
  }

  /** 스냅샷 upsert – 컴팩션 시 사용 */
  async upsertSnapshot(
    episodeId: string,
    data: Uint8Array | Buffer,
  ): Promise<YSnapshotEntity> {
    const entity = this.create({
      episodeId,
      data: Buffer.from(data),
    })
    // PK 충돌 시 덮어쓰기
    await this.save(entity)
    return entity
  }

  /** 스냅샷 삭제 (회차가 삭제될 때 호출) */
  async deleteByEpisodeId(episodeId: string) {
    await this.delete({ episodeId })
  }
}
