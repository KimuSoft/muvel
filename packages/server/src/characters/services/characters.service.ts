import { Injectable } from "@nestjs/common"
import { CharacterEntity } from "../character.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { UpdateCharacterDto } from "../dto/update-character.dto"

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(CharacterEntity)
    private readonly charactersRepository: Repository<CharacterEntity>
  ) {}

  public async createCharacter() {
    const character = new CharacterEntity()
    character.name = "새 캐릭터"
    character.summary = "캐릭터 설명"

    return this.charactersRepository.save(character)
  }

  public async findCharacterById(id: string) {
    // req.character 그대로 돌려보내도 될 듯
    return Promise.resolve()
  }

  async updateCharacter(id: string, dto: UpdateCharacterDto) {
    return Promise.resolve(undefined)
  }

  async deleteCharacter(id: string) {
    return this.charactersRepository.delete(id)
  }
}
