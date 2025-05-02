import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { NovelEntity } from "../novel.entity"
import { ShareType } from "muvel-api-types"

@Injectable()
export class NovelPermissionService {
  constructor(
    @InjectRepository(NovelEntity)
    private readonly novelRepository: Repository<NovelEntity>,
  ) {}

  public async getPermissions(
    novelOrId: string | NovelEntity,
    userId?: string | null,
  ) {
    const novel =
      typeof novelOrId === "string"
        ? await this.novelRepository.findOne({
            where: { id: novelOrId },
            relations: ["author"],
          })
        : novelOrId

    if (!novel) {
      throw new NotFoundException(`Novel with id ${novelOrId} not found`)
    }

    const isAuthor = novel.author.id === userId

    return {
      novel,
      permissions: {
        read: isAuthor || novel.share !== ShareType.Private,
        edit: isAuthor,
        delete: isAuthor,
      },
    }
  }
}
