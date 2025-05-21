import {
  BlockAttrs,
  DeltaBlockAction,
  DeltaEpisodeBlock,
  EpisodeBlockType,
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
  ValidateIf,
} from "class-validator"
import { Transform } from "class-transformer"

export class EpisodeDeltaBlockDto implements DeltaEpisodeBlock {
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
  @Transform(({ value }) => new Date(value)) // 문자열을 Date 객체로 변환
  @IsDate()
  date: Date // muvel-api-types 에서는 Date | string 이지만, DTO 레벨에서는 Date로 통일

  // action이 'create' 또는 'update'일 때만 유효한 필드들
  @ApiProperty({
    description: "블록의 ProseMirror JSON 내용 (생성/수정 시 필요)",
    type: [Object], // Swagger에서는 PMNodeJSON[] 타입을 명확히 표현하기 어려울 수 있음
    required: false,
  })
  @ValidateIf(
    (o) =>
      o.action === DeltaBlockAction.Create ||
      o.action === DeltaBlockAction.Update,
  )
  @IsArray()
  @IsOptional() // 업데이트 시 content가 없을 수도 있음 (다른 필드만 변경)
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
  attr?: BlockAttrs | null // API 타입에 맞춰 null 허용

  @ApiProperty({
    description: "에피소드 블록의 타입 (생성/수정 시 필요)",
    enum: EpisodeBlockType,
    required: false,
  })
  @ValidateIf(
    (o) =>
      o.action === DeltaBlockAction.Create ||
      o.action === DeltaBlockAction.Update,
  )
  @IsEnum(EpisodeBlockType)
  @IsOptional() // 업데이트 시 blockType이 없을 수도 있음
  blockType?: EpisodeBlockType

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
  @IsOptional() // 업데이트 시 order가 없을 수도 있음
  order?: number
}
