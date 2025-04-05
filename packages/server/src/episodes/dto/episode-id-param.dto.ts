import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsUUID } from "class-validator"

export class EpisodeIdParamDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  id: string
}
