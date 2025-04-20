import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString, Length } from "class-validator"

export class UpdateEpisodeDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  title: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  chapter: string
}
