import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator"
import { EpisodeType, ShareType } from "../../types"
import { Transform } from "class-transformer"

export class CreateEpisodeDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  title: string = "새 에피소드"

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string = ""

  @Transform(({ value }) => parseInt(value.toString()))
  @ApiProperty({
    description:
      "에피소드의 종류 (일반편, 특별편, 프롤로그, 에필로그, 챕터 등)",
    type: "enum",
    enum: EpisodeType,
  })
  @IsEnum(EpisodeType)
  @IsOptional()
  episodeType: EpisodeType = EpisodeType.Episode

  @ApiProperty()
  @IsOptional()
  @IsInt()
  order?: number
}
