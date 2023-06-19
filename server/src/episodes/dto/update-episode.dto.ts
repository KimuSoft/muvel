import { ApiProperty } from "@nestjs/swagger"

export class UpdateEpisodeDto {
  @ApiProperty()
  chapter: string

  @ApiProperty()
  title: string

  @ApiProperty()
  description: string
}
