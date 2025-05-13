import {
  BlockAttrs,
  BlockType,
  DeltaBlock,
  DeltaBlockAction,
  PMNodeJSON,
} from "muvel-api-types"
import { ApiProperty } from "@nestjs/swagger"
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsUUID,
} from "class-validator"
import { Transform } from "class-transformer"

export class DeltaBlockDto implements DeltaBlock {
  @ApiProperty({
    type: "string",
    format: "uuid",
  })
  @IsUUID()
  id: string

  @ApiProperty({
    type: "string",
    enum: DeltaBlockAction,
  })
  @IsEnum(DeltaBlockAction)
  action: DeltaBlockAction

  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  date: Date

  // 기본 필드들

  @ApiProperty({
    type: "object",
    additionalProperties: true,
  })
  @IsArray()
  @IsOptional()
  content?: PMNodeJSON[]

  @ApiProperty({
    type: "object",
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  attr?: BlockAttrs

  @ApiProperty({
    type: "number",
    enum: BlockType,
  })
  @IsEnum(BlockType)
  @IsOptional()
  blockType?: BlockType

  @ApiProperty({
    type: "number",
  })
  @IsOptional()
  @IsNumber()
  order?: number
}
