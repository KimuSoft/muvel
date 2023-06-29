import { IsUUID } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { BlockType } from "../../types"

export class BlockDto {
  @ApiProperty()
  @IsUUID()
  id: string

  @ApiProperty()
  content: string

  @ApiProperty()
  blockType: BlockType

  @ApiProperty()
  order: number

  @ApiProperty()
  episodeId: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
