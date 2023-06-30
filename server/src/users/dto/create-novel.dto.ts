import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsString } from "class-validator"
import { ShareType } from "../../types"

export class CreateNovelDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string

  @ApiProperty({
    description: "소설의 공개 범위",
    type: "enum",
    enum: ShareType,
  })
  @IsEnum(ShareType)
  share: ShareType
}
