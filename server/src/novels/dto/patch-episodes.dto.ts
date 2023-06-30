import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsString } from "class-validator"

export class PatchEpisodesDto {
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsString()
  chapter: string

  @ApiProperty()
  @IsNumber()
  order: number
}
