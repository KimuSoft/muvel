import { BlockType, PMNodeJSON } from "muvel-api-types"
import { ApiProperty } from "@nestjs/swagger"
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator"

export class PatchEpisodeBlocksDto {
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty()
  @IsObject({ each: true })
  content: PMNodeJSON[]

  @ApiProperty()
  @IsNumber()
  blockType: BlockType

  @ApiProperty()
  @IsObject()
  attr: Record<string, string>

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isDeleted = false

  @ApiProperty()
  @IsNumber()
  order: number
}
