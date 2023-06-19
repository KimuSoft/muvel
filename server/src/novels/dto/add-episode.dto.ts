import { ApiProperty } from "@nestjs/swagger"

export class AddEpisodeDto {
  @ApiProperty()
  title: string

  @ApiProperty()
  description: string

  @ApiProperty()
  chapter: string
}
