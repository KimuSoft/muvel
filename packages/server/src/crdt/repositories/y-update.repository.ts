// src/crdt/repositories/y-update.repository.ts
import { Injectable } from "@nestjs/common"
import { DataSource, MoreThan, Repository } from "typeorm"
import { YUpdateEntity } from "../entities/y-update.entity"

@Injectable()
export class YUpdateRepository extends Repository<YUpdateEntity> {
  constructor(dataSource: DataSource) {
    super(YUpdateEntity, dataSource.createEntityManager())
  }

  /** 다음 시퀀스 번호 반환 (트랜잭션 내에서 호출 권장) */
  async nextSeq(episodeId: string): Promise<string> {
    const last = await this.createQueryBuilder("u")
      .select("MAX(u.seq)", "max")
      .where("u.episodeId = :id", { id: episodeId })
      .getRawOne<{ max: string | null }>()

    return (BigInt(last?.max ?? "0") + 1n).toString()
  }

  /** Δ update append */
  async append(
    episodeId: string,
    seq: string,
    data: Uint8Array | Buffer,
  ): Promise<void> {
    await this.insert({
      episodeId,
      seq,
      data: Buffer.from(data),
    })
  }

  /** 특정 seq 이후의 업데이트 배열 */
  async findAfterSeq(
    episodeId: string,
    fromSeq: string,
  ): Promise<YUpdateEntity[]> {
    return this.find({
      where: {
        episodeId,
        seq: MoreThan(fromSeq), // ✅ TypeORM FindOperator 사용
      },
      order: { seq: "ASC" },
    })
  }

  /** 회차의 모든 로그 삭제 (컴팩션 후) */
  async clearByEpisodeId(episodeId: string): Promise<void> {
    await this.delete({ episodeId })
  }
}
