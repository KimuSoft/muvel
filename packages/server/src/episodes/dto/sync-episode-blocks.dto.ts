import { IsArray, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { EpisodeDeltaBlockDto } from "../../blocks/dto/episode-delta-block.dto"
import { ApiProperty } from "@nestjs/swagger"

export class SyncEpisodeBlocksDto {
  @ApiProperty({
    description: "동기화할 에피소드 델타 블록 목록",
    type: [EpisodeDeltaBlockDto],
  })
  @IsArray()
  @ValidateNested({ each: true }) // 배열의 각 요소에 대해 유효성 검사 수행
  @Type(() => EpisodeDeltaBlockDto) // 배열 요소의 타입을 명시적으로 지정
  deltaBlocks: EpisodeDeltaBlockDto[]
}
