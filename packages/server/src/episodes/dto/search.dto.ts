import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class SearchQueryDto {
  @ApiProperty({
    description: "검색어",
  })
  @IsString()
  q: string

  @ApiProperty({
    description: "검색할 대상",
    example: "novel",
  })
  @IsString()
  target: "block" | "character"
}
