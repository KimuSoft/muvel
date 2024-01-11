import { ApiProperty } from "@nestjs/swagger"
import { IsInt, IsOptional, IsString, Min } from "class-validator"
import { Transform } from "class-transformer"
import { NovelDto } from "./novel.dto"
import { PartialUserDto } from "../../users/dto/user.dto"

export class SearchNovelsDto {
  @ApiProperty({ description: "제목 검색", required: false })
  @IsOptional()
  @IsString()
  title: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  author?: string

  @Transform(({ value }) => parseInt(value.toString()))
  @ApiProperty({ default: 0, required: false, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  start: number = 0

  @Transform(({ value }) => parseInt(value.toString()))
  @ApiProperty({ default: 20, required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  display: number = 20
}

export class SearchNovelsResponseDto extends NovelDto {
  @ApiProperty()
  author: PartialUserDto
}
