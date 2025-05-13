import { IsArray, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { DeltaBlockDto } from "./delta-block.dto"

export class SyncBlockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeltaBlockDto)
  deltaBlocks: DeltaBlockDto[]
}
