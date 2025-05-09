import { Injectable } from "@nestjs/common"
import { DataSource, Repository } from "typeorm"
import { EpisodeEntity } from "../entities/episode.entity"
import { CreateEpisodeDto } from "../dto/create-episode.dto"
import { EpisodeType } from "muvel-api-types"

@Injectable()
export class EpisodeRepository extends Repository<EpisodeEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(EpisodeEntity, dataSource.createEntityManager())
  }

  private async getNextOrder(episodeType: EpisodeType, novelId?: string) {
    if (!novelId) return 1

    const lastEpisode: { order: string }[] = await this.query(
      'SELECT "order" FROM "episode" WHERE "novelId" = $1 ORDER BY "order" DESC LIMIT 1',
      [novelId],
    )
    return episodeType === EpisodeType.Episode
      ? Math.floor(parseFloat(lastEpisode?.[0].order)) + 1
      : parseFloat(lastEpisode?.[0].order) + 1 / 10000
  }

  public async createEpisode(
    novelId: string,
    createEpisodeDto: CreateEpisodeDto,
  ) {
    const order = await this.getNextOrder(
      createEpisodeDto.episodeType || EpisodeType.Episode,
      novelId,
    )

    const episode = this.create({
      title: createEpisodeDto.title,
      episodeType: createEpisodeDto.episodeType,
      order: order,
      novel: { id: novelId },
    })
    await this.save(episode)

    return episode
  }

  public async createInitialEpisode() {
    const episode = new EpisodeEntity()
    episode.title = "새 에피소드"
    episode.order = 1

    return this.save(episode)
  }
}
