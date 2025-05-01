import { Module } from "@nestjs/common"
import { CharactersService } from "./services/characters.service"
import { CharactersController } from "./characters.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CharacterEntity } from "./character.entity"
import { CharacterPermissionService } from "./services/character-permission.service"

@Module({
  imports: [TypeOrmModule.forFeature([CharacterEntity])],
  providers: [CharactersService, CharacterPermissionService],
  controllers: [CharactersController],
})
export class CharactersModule {}
