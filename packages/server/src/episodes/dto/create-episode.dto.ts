import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsString } from "class-validator"
import { CreateEpisodeBodyDto, EpisodeType } from "muvel-api-types"
import { Transform } from "class-transformer"

export class CreateEpisodeDto implements CreateEpisodeBodyDto {
  @ApiProperty({
    description: "에피소드 제목",
    type: "string",
    default: "새 에피소드",
  })
  @IsOptional()
  @IsString()
  title: string = "새 에피소드"

  @Transform(({ value }) => parseInt(value.toString()))
  @ApiProperty({
    description:
      "에피소드의 종류 (일반편, 특별편, 프롤로그, 에필로그, 챕터 등)",
    type: "number",
    enum: EpisodeType,
    default: EpisodeType.Episode,
  })
  @IsEnum(EpisodeType)
  @IsOptional()
  episodeType: EpisodeType = EpisodeType.Episode
}

// 타입 정합성 검사를 위한 코드
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ =
  {} as Required<CreateEpisodeDto> satisfies Required<CreateEpisodeBodyDto>
