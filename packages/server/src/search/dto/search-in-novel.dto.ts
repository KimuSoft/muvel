import { IsInt, IsOptional, IsString, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"

export class SearchInNovelDto {
  @ApiProperty({ description: "검색어", required: false })
  @IsOptional()
  @IsString()
  q: string

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
