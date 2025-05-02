import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { CharacterEntity } from "../character.entity"
import { BasePermission, ShareType } from "muvel-api-types"

@Injectable()
export class CharacterPermissionService {
  constructor(
    @InjectRepository(CharacterEntity)
    private readonly characterRepository: Repository<CharacterEntity>,
  ) {}

  async getPermission(
    characterOrId: CharacterEntity | string,
    userId?: string,
  ): Promise<
    CharacterEntity & {
      permissions: BasePermission
    }
  > {
    const character =
      typeof characterOrId === "string"
        ? await this.characterRepository.findOne({
            where: { id: characterOrId },
            relations: ["novel", "novel.author"],
          })
        : characterOrId

    if (!character) {
      throw new NotFoundException(`Episode with id ${characterOrId} not found`)
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
