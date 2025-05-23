import { ApiProperty } from "@nestjs/swagger"
import { ShareType, UpdateNovelRequestDto } from "muvel-api-types"
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from "class-validator"
import { Transform } from "class-transformer"

export class UpdateNovelDto implements UpdateNovelRequestDto {
  @ApiProperty({
    description: "소설 제목",
    example: "파링의 모험",
  })
  @IsString()
  @IsOptional()
  @Length(1, 128)
  title?: string

  @ApiProperty({
    description: "소설 설명",
    example: "파링이 모험을 떠나는 이야기",
  })
  @IsString()
  @Length(0, 20000)
  @IsOptional()
  description?: string

  @Transform(({ value }) => parseInt(value.toString()))
  @ApiProperty({
    description: "소설의 공개 범위",
    type: "number",
    enum: ShareType,
  })
  @IsEnum(ShareType)
  @IsOptional()
  share?: ShareType

  @ApiProperty({
    description: "소설 태그",
    example: ["모험", "판타지"],
  })
  @IsString({ each: true })
  @Transform(({ value }) => [...new Set(value)])
  @IsOptional()
  tags?: string[]

  @ApiProperty({
    description: "소설 썸네일 이미지 URL",
    example: "파링의 모험",
  })
  @IsUrl()
  @IsOptional()
  thumbnail?: string

  @ApiProperty({
    description: "소설 정렬 순서",
  })
  @IsOptional()
  @IsNumber()
  order?: number

  @ApiProperty({
    description: "소설 총 회차 수",
  })
  @IsOptional()
  @IsNumber()
  episodeCount?: number
}

// 타입 정합성 검사를 위한 코드
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ =
  {} as Required<UpdateNovelDto> satisfies Required<UpdateNovelRequestDto>
