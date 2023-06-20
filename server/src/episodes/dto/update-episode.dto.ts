import { ApiProperty } from "@nestjs/swagger"

export class UpdateEpisodeDto {
  @ApiProperty()
  title: string

  @ApiProperty()
  description: string

  @ApiProperty()
  chapter: string
}
