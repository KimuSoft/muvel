import { Injectable, NotFoundException } from "@nestjs/common"
import { EpisodeEntity } from "../entities/episode.entity"
import { EpisodeRepository } from "../repositories/episode.repository"
import { ShareType } from "muvel-api-types"

@Injectable()
export class EpisodePermissionService {
  constructor(private readonly episodesRepository: EpisodeRepository) {}

  public async getPermissions(
    episodeOrId: string | EpisodeEntity,
    userId?: string | null
  ) {
    const episode =
      typeof episodeOrId === "string"
        ? await this.episodesRepository.findOne({
            where: { id: episodeOrId },
            relations: ["novel", "novel.author"],
          })
        : episodeOrId

    if (!episode) {
      throw new NotFoundException(`Episode with id ${episodeOrId} not found`)
    }

    const isAuthor = episode.novel.author.id === userId

    return {
      episode,
      permissions: {
        read: isAuthor || episode.novel.share !== ShareType.Private,
        edit: isAuthor,
        delete: isAuthor,
      },
    }
  }
}
