import { ApiProperty } from "@nestjs/swagger"
import { IsUrl, IsUUID } from "class-validator"
import { EpisodeDto } from "../../episodes/dto/episode.dto"
import { ShareType } from "../../types"

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

  @ApiProperty({
    description: "소설 썸네일 이미지 URL",
  })
  @IsUrl()
  thumbnail: string

  @ApiProperty()
  episodeIds: string[]

  @ApiProperty()
  authorId: string

  @ApiProperty()
  share: ShareType

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class NovelDtoWithEpisodes extends NovelDto {
  @ApiProperty({
    description: "소설의 에피소드로 회차 순서로 정렬되어 있습니다.",
    type: [EpisodeDto],
  })
  episodes: EpisodeDto[]
}
