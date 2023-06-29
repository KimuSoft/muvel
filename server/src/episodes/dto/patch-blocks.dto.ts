import { BlockType } from "../../types"
import { ApiProperty } from "@nestjs/swagger"

export class PatchBlocksDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  content: string

  @ApiProperty()
  blockType: BlockType

  @ApiProperty()
  isDeleted: boolean

  @ApiProperty()
  order: number
}
