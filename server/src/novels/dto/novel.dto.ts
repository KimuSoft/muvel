import { ApiProperty } from "@nestjs/swagger"
import { IsUUID } from "class-validator"
import { UserDto } from "../../users/dto/user.dto"

export class NovelDto {
  @ApiProperty({
    description: "소설의 UUID",
    example: "d0b0d0b0-d0b0-d0b0-d0b0-d0b0d0b0d0b0",
  })
  @IsUUID()
  id: string

  @ApiProperty({
    description: "소설 제목",
    example: "파링의 모험",
  })
  title: string

  @ApiProperty({
    description: "소설 설명",
    example: "파링이 모험을 떠나는 이야기",
  })
  description: string

  @ApiProperty()
  episodes: any[]

  @ApiProperty()
  authorId: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
