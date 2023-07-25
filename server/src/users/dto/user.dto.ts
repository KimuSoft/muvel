import { ApiProperty } from "@nestjs/swagger"

export class PartialUserDto {
  @ApiProperty({ description: "유저 ID" })
  id: string

  @ApiProperty({ example: "파링" })
  username: string

  @ApiProperty()
  avatar: string

  @ApiProperty()
  admin: boolean
}

export class UserDto extends PartialUserDto {
  @ApiProperty()
  novelIds: string[]

  @ApiProperty()
  recentEpisodeId: string
}
