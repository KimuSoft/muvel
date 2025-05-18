import { ApiProperty } from "@nestjs/swagger"
import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator"
import { UpdateWikiPageRequestBody, WikiPageCategory } from "muvel-api-types"

// UpdateWikiPageRequestBody 타입을 만족하도록 DTO 수정
// Pick<WikiPage, "title" | "summary" | "category" | "tags" | "thumbnail" | "attributes"> 의 Partial 타입
export class UpdateWikiPageDto implements UpdateWikiPageRequestBody {
  @ApiProperty({
    description: "위키 페이지 제목",
    example: "주인공 설정 (수정)",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string

  @ApiProperty({
    description: "위키 페이지 요약",
    required: false,
    example: "주인공에 대한 상세 정보를 담고 있습니다. (수정됨)",
  })
  @IsOptional()
  @IsString()
  summary?: string | null

  @ApiProperty({
    description: "위키 페이지 카테고리",
    enum: WikiPageCategory,
    required: false,
  })
  @IsOptional()
  @IsEnum(WikiPageCategory)
  category?: WikiPageCategory | null

  @ApiProperty({
    description: "태그 배열",
    type: [String],
    required: false,
    example: ["캐릭터", "주요인물", "업데이트됨"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiProperty({
    description: "썸네일 이미지 URL",
    required: false,
    example:
      "[https://example.com/new_thumbnail.jpg](https://example.com/new_thumbnail.jpg)",
  })
  @IsOptional()
  @IsString() // IsUrl()도 고려 가능
  thumbnail?: string | null

  @ApiProperty({
    description: "사용자 정의 속성 (키-값 형태)",
    type: "object",
    additionalProperties: { type: "string" },
    example: { 나이: "26", 직업: "용사" },
  })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, string>
}
