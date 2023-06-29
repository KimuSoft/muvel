import { ApiProperty } from "@nestjs/swagger"
import { IsString, Length, MIN } from "class-validator"

export class UpdateEpisodeDto {
  @ApiProperty()
  @IsString()
  @Length(1)
  title: string

  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty()
  @IsString()
  chapter: string
}
