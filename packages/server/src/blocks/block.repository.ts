// src/blocks/block.repository.ts
import { DataSource, Repository } from "typeorm"
import { Injectable } from "@nestjs/common"
import { BlockEntity } from "./block.entity"
import { BlockType } from "muvel-api-types"

@Injectable()
export class BlockRepository extends Repository<BlockEntity> {
  constructor(ds: DataSource) {
    super(BlockEntity, ds.createEntityManager())
  }

  /**
   * 회차(episode)에 속한 블록을 순서대로 반환
   * @param episodeId   회차 UUID
   * @param opts.withComments  false 로 주면 Comment 블록을 제외
   */
  async getBlocksByEpisodeId(
    episodeId: string,
    opts: { withComments?: boolean } = {},
  ): Promise<BlockEntity[]> {
    const qb = this.createQueryBuilder("b")
      .leftJoin("b.episode", "e")
      .where("e.id = :episodeId", { episodeId })

    if (opts.withComments === false) {
      qb.andWhere("b.blockType <> :commentType", {
        commentType: BlockType.Comment,
      })
    }

    return qb.orderBy("b.order", "ASC").getMany()
  }

  /** Block 배열을 PK(id) 기준으로 대량 upsert */
  async bulkUpsert(blocks: Partial<BlockEntity>[]) {
    if (!blocks.length) return
    await this.createQueryBuilder()
      .insert()
      .into(BlockEntity)
      .values(blocks)
      .orUpdate(["content", "text", "blockType", "order", "updatedAt"], ["id"])
      .execute()
  }
}
