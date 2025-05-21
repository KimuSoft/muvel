import { ApiProperty } from "@nestjs/swagger"
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator"
import { EpisodeType, ShareType, UpdateEpisodeBodyDto } from "muvel-api-types"

export class UpdateEpisodeDto implements UpdateEpisodeBodyDto {
  @ApiProperty({
    description: "에피소드 제목",
    example: "제목",
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string

  @ApiProperty({
    description: "에피소드 설명",
    example: "설명",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({
    description: "작가의 말",
    required: false,
  })
  @IsString()
  @IsOptional()
  authorComment?: string

  @ApiProperty({
    description: "에피소드 타입",
    required: false,
    enum: EpisodeType,
  })
  @IsOptional()
  @IsEnum(EpisodeType)
  episodeType?: EpisodeType

  @ApiProperty({
    description: "에피소드 플로우 문서 오브젝트",
    required: false,
  })
  @IsOptional()
  @IsObject()
  flowDoc: any

  @ApiProperty({
    description: "에피소드 회차 순서",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  order: number
}

// 타입 정합성 검사를 위한 코드
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ =
  {} as Required<UpdateEpisodeDto> satisfies Required<UpdateEpisodeBodyDto>
