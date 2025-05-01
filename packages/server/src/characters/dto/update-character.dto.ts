import { IsEnum, IsObject, IsOptional, IsString, IsUrl } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { CharacterImportance } from "muvel-api-types"

export class UpdateCharacterDto {
  @ApiProperty({
    description: "캐릭터 이름",
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({
    description: "캐릭터 아바타 URL",
    required: false,
  })
  @IsUrl()
  @IsOptional()
  avatar?: string | null

  @ApiProperty({
    description: "캐릭터 태그",
    required: false,
    type: [String],
  })
  @IsString({ each: true })
  @IsOptional()
  tags?: string[]

  @ApiProperty({
    description: "캐릭터 설명",
    required: false,
  })
  @IsString()
  @IsOptional()
  summary?: string | null

  @ApiProperty({
    description: "캐릭터 갤러리",
    required: false,
    type: [String],
  })
  @IsString({ each: true })
  @IsUrl()
  @IsOptional()
  galleries?: string[]

  @ApiProperty({
    description: "캐릭터 중요도",
    required: false,
    enum: CharacterImportance,
  })
  @IsOptional()
  @IsEnum(CharacterImportance)
  importance?: CharacterImportance

  @ApiProperty({
    description: "캐릭터 속성",
    required: false,
    type: "object",
  })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, string>
}
