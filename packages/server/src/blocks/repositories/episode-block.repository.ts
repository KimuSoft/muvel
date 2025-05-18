import { Injectable } from "@nestjs/common"
import { DataSource, Not, Repository } from "typeorm"
import { EpisodeBlockEntity } from "../entities/episode-block.entity"
import { EpisodeBlockType } from "muvel-api-types"

@Injectable()
export class EpisodeBlockRepository extends Repository<EpisodeBlockEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(EpisodeBlockEntity, dataSource.createEntityManager())
  }

  async findBlocksByEpisodeId(
    episodeId: string,
    options: {
      hideComments?: boolean
    } = { hideComments: false },
  ): Promise<EpisodeBlockEntity[]> {
    return this.find({
      where: {
        episode: { id: episodeId },
        ...(options.hideComments
          ? { blockType: Not(EpisodeBlockType.Comment) }
          : {}),
      },
      order: { order: "ASC" },
    })
  }
}
