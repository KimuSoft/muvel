import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsString } from "class-validator"
import { CreateNovelRequestDto, ShareType } from "muvel-api-types"

export class CreateNovelDto implements CreateNovelRequestDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string = ""

  @ApiProperty({
    description: "소설의 공개 범위",
    type: "number",
    enum: ShareType,
  })
  @IsEnum(ShareType)
  @IsOptional()
  share: ShareType = ShareType.Private
}

// 타입 정합성 검사를 위한 코드
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ =
  {} as Required<CreateNovelDto> satisfies Required<CreateNovelRequestDto>
