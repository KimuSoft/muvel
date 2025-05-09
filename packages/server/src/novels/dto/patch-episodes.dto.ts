import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsString } from "class-validator"
import { Episode } from "muvel-api-types"

// TODO: 이거 말고 다른 필드도 그냥 들어오는 취약점 있음
export class PatchEpisodesDto
  implements Pick<Episode, "id" | "title" | "order">
{
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsNumber()
  order: number
}
