import { ApiProperty } from "@nestjs/swagger"

export class UserDto {
  @ApiProperty({
    description: "유저 ID",
  })
  id: string

  @ApiProperty()
  username: string

  @ApiProperty()
  novelIds: string[]
}
