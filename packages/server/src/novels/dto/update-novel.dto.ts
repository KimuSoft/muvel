import { ApiProperty } from "@nestjs/swagger"
import { ShareType } from "../../types"
import { IsEnum, IsOptional, IsString, IsUrl, Length } from "class-validator"
import { Transform } from "class-transformer"

export class UpdateNovelDto {
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
    type: "enum",
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
}
