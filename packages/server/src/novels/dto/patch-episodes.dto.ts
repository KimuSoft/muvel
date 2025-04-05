import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsNumberString, IsOptional, IsString } from "class-validator"
import { Transform } from "class-transformer"

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
  @Transform((value) => value.toString())
  @IsNumberString()
  order: string
}
