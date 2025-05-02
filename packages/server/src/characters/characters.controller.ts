import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
} from "@nestjs/common"
import { CharactersService } from "./services/characters.service"
import { UpdateCharacterDto } from "./dto/update-character.dto"
import { RequirePermission } from "../permissions/require-permission.decorator"
import {
  CharacterPermissionGuard,
  CharacterPermissionRequest,
} from "../permissions/character-permission.guard"

@Controller("characters")
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  // 단일 캐릭터 조회
  @Get(":id")
  @RequirePermission("read", CharacterPermissionGuard)
  async getCharacter(@Req() req: CharacterPermissionRequest) {
    return req.character
  }

  // 캐릭터 수정
  @Patch(":id")
  @RequirePermission("edit", CharacterPermissionGuard)
  async updateCharacter(
    @Param("id") id: string,
    @Body() dto: UpdateCharacterDto,
  ) {
    // 캐릭터 ID로 캐릭터 정보를 수정하는 로직을 구현합니다.
    return this.charactersService.updateCharacter(id, dto)
  }

  // 캐릭터 삭제
  @Delete(":id")
  @RequirePermission("delete", CharacterPermissionGuard)
  async deleteCharacter(@Param("id") id: string) {
    // 캐릭터 ID로 캐릭터 정보를 삭제하는 로직을 구현합니다.
    return this.charactersService.deleteCharacter(id)
  }
}
