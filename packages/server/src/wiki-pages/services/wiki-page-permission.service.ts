import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BasePermission, ShareType } from "muvel-api-types"
import { WikiPageEntity } from "../wiki-page.entity"

@Injectable()
export class WikiPagePermissionService {
  constructor(
    @InjectRepository(WikiPageEntity)
    private readonly wikiPageRepository: Repository<WikiPageEntity>,
  ) {}

  async getPermission(
    wikiPageOrId: WikiPageEntity | string,
    userId?: string,
  ): Promise<
    WikiPageEntity & {
      permissions: BasePermission
    }
  > {
    const character =
      typeof wikiPageOrId === "string"
        ? await this.wikiPageRepository.findOne({
            where: { id: wikiPageOrId },
            relations: ["novel", "novel.author"],
          })
        : wikiPageOrId

    if (!character) {
      throw new NotFoundException(`Wiki Page with id ${wikiPageOrId} not found`)
    }

    const isAuthor = character.novel.author.id === userId

    return {
      ...character,
      permissions: {
        read: isAuthor || character.novel.share !== ShareType.Private,
        edit: isAuthor,
        delete: isAuthor,
      },
    }
  }
}
