import {
  BlockAttrs,
  DeltaBlockAction,
  PMNodeJSON,
  DeltaWikiBlock, // muvel-api-types에서 가져옴
  WikiBlockType, // muvel-api-types에서 가져옴
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
  ValidateIf,
} from "class-validator"
import { Transform } from "class-transformer"

export class WikiDeltaBlockDto implements DeltaWikiBlock {
  @ApiProperty({
    description: "블록의 고유 ID",
    type: "string",
    format: "uuid",
  })
  @IsUUID()
  id: string

  @ApiProperty({
    description: "블록 변경 작업의 종류 (생성, 수정, 삭제)",
    enum: DeltaBlockAction,
  })
  @IsEnum(DeltaBlockAction)
  action: DeltaBlockAction

  @ApiProperty({
    description: "변경 작업이 발생한 시간 (ISO 8601 문자열)",
    type: "string",
    format: "date-time",
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  date: Date

  @ApiProperty({
    description: "블록의 ProseMirror JSON 내용 (생성/수정 시 필요)",
    type: [Object],
    required: false,
  })
  @ValidateIf(
    (o) =>
      o.action === DeltaBlockAction.Create ||
      o.action === DeltaBlockAction.Update,
  )
  @IsArray()
  @IsOptional()
  content?: PMNodeJSON[]

  @ApiProperty({
    description: "블록의 추가 속성 (생성/수정 시 필요)",
    type: "object",
    additionalProperties: true,
  })
  @ValidateIf(
    (o) =>
      o.action === DeltaBlockAction.Create ||
      o.action === DeltaBlockAction.Update,
  )
  @IsObject()
  @IsOptional()
  attr?: BlockAttrs | null

  @ApiProperty({
    description: "위키 블록의 타입 (생성/수정 시 필요)",
    enum: WikiBlockType,
    required: false,
  })
  @ValidateIf(
    (o) =>
      o.action === DeltaBlockAction.Create ||
      o.action === DeltaBlockAction.Update,
  )
  @IsEnum(WikiBlockType)
  @IsOptional()
  blockType?: WikiBlockType

  @ApiProperty({
    description: "블록의 순서 (생성/수정 시 필요)",
    type: "number",
    required: false,
  })
  @ValidateIf(
    (o) =>
      o.action === DeltaBlockAction.Create ||
      o.action === DeltaBlockAction.Update,
  )
  @IsNumber()
  @IsOptional()
  order?: number
}
