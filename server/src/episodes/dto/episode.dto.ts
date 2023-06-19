import { IsUUID } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class EpisodeDto {
  @ApiProperty({
    description: "에피소드 아이디",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  id: string

  @ApiProperty({
    description: "에피소드 제목",
    example: "에피소드의 제목",
  })
  title: string

  @ApiProperty()
  description: string

  @ApiProperty()
  chapter: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
