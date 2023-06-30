import { BlockType } from "../../types"
import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsNumber, IsString } from "class-validator"

export class PatchBlocksDto {
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty()
  @IsString()
  content: string

  @ApiProperty()
  @IsNumber()
  blockType: BlockType

  @ApiProperty()
  @IsBoolean()
  isDeleted: boolean

  @ApiProperty()
  @IsNumber()
  order: number
}
