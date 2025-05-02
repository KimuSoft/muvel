import { Injectable } from "@nestjs/common"
import { CharacterEntity } from "../character.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { UpdateCharacterDto } from "../dto/update-character.dto"

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(CharacterEntity)
    private readonly charactersRepository: Repository<CharacterEntity>,
  ) {}

  public async createCharacter() {
    const character = new CharacterEntity()
    character.name = "새 캐릭터"

    return this.charactersRepository.save(character)
  }

  async updateCharacter(id: string, dto: UpdateCharacterDto) {
    return this.charactersRepository.update(id, dto)
  }

  async deleteCharacter(id: string) {
    return this.charactersRepository.delete(id)
  }
}
