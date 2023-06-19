import { ApiProperty } from "@nestjs/swagger"

export class UpdateNovelDto {
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
}
