import { Injectable } from "@nestjs/common"
import { DataSource, Repository } from "typeorm"
import { BlockEntity } from "./block.entity"

@Injectable()
export class BlockRepository extends Repository<BlockEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(BlockEntity, dataSource.createEntityManager())
  }

  async getBlocksByEpisodeId(episodeId: string): Promise<BlockEntity[]> {
    return this.find({
      where: { episode: { id: episodeId } },
      order: { order: "ASC" },
    })
  }
}
