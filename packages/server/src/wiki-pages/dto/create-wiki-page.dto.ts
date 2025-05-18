import { ApiProperty } from "@nestjs/swagger"
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator"
import { CreateWikiPageRequestBody, WikiPageCategory } from "muvel-api-types"

export class CreateWikiPageDto implements CreateWikiPageRequestBody {
  @ApiProperty({
    description:
      "위키 페이지 제목. API 스펙상 선택 사항이지만, 일반적으로 생성 시 필요합니다.",
    example: "주인공 설정",
    required: false, // API 스펙 반영
  })
  @IsOptional() // API 스펙 반영
  @IsString()
  @MinLength(1) // 최소 길이는 유지 (서버측 비즈니스 로직)
  @MaxLength(255)
  title?: string // API 스펙상 선택 사항

  @ApiProperty({
    description: "위키 페이지 카테고리",
    enum: WikiPageCategory,
    required: false, // API 스펙 반영
  })
  @IsOptional() // API 스펙 반영
  @IsEnum(WikiPageCategory)
  category?: WikiPageCategory | null
}
