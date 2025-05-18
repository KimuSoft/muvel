import { IsArray, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"
import { WikiDeltaBlockDto } from "../../blocks/dto/wiki-delta-block.dto"

export class SyncWikiBlocksDto {
  @ApiProperty({
    description: "동기화할 위키 델타 블록 목록",
    type: [WikiDeltaBlockDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WikiDeltaBlockDto)
  deltaBlocks: WikiDeltaBlockDto[]
}
