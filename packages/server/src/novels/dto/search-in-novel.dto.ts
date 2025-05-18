import { ApiPropertyOptional } from "@nestjs/swagger"
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator"
import { Transform } from "class-transformer"
import { NovelSearchItemType } from "muvel-api-types" // NovelSearchItemType 임포트

export class SearchInNovelDto {
  @ApiPropertyOptional({ description: "검색어" })
  @IsOptional()
  @IsString()
  q?: string // 검색어가 없는 경우 전체 목록의 필터링된 결과를 반환할 수 있도록 optional 유지

  @ApiPropertyOptional({
    description: "검색 결과 시작 오프셋",
    default: 0,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  start?: number = 0

  @ApiPropertyOptional({
    description: "한 페이지에 표시할 검색 결과 수",
    default: 20,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  display?: number = 20

  @ApiPropertyOptional({
    description:
      "검색할 항목 타입 배열. 지정하지 않으면 소설과 관련된 모든 주요 타입을 검색 대상으로 할 수 있습니다.",
    enum: NovelSearchItemType,
    isArray: true,
    example: [NovelSearchItemType.EpisodeBlock, NovelSearchItemType.WikiPage],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(NovelSearchItemType, { each: true })
  itemTypes?: NovelSearchItemType[]
}
