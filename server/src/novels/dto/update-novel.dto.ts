import { ApiProperty } from "@nestjs/swagger"
import { ShareType } from "../../types"
import { IsEnum, IsString, Length } from "class-validator"
import { Transform } from "class-transformer"

export class UpdateNovelDto {
  @ApiProperty({
    description: "소설 제목",
    example: "파링의 모험",
  })
  @IsString()
  @Length(1, 128)
  title: string

  @ApiProperty({
    description: "소설 설명",
    example: "파링이 모험을 떠나는 이야기",
  })
  @IsString()
  @Length(0, 20000)
  description: string

  @Transform(({ value }) => parseInt(value.toString()))
  @ApiProperty({
    description: "소설의 공개 범위",
    type: "enum",
    enum: ShareType,
  })
  @IsEnum(ShareType)
  share: ShareType
}
