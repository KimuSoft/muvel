import { Injectable } from "@nestjs/common"
import { DataSource, Not, Repository } from "typeorm"
import { BlockEntity } from "./entities/block.entity"
import { BlockType } from "muvel-api-types"

@Injectable()
export class BlockRepository extends Repository<BlockEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(BlockEntity, dataSource.createEntityManager())
  }

  async findBlocksByEpisodeId(
    episodeId: string,
    options: {
      hideComments?: boolean
    } = { hideComments: false },
  ): Promise<BlockEntity[]> {
    return this.find({
      where: {
        episode: { id: episodeId },
        ...(options.hideComments ? { blockType: Not(BlockType.Comment) } : {}),
      },
      order: { order: "ASC" },
    })
  }
}
