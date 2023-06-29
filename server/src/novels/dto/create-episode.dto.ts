import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"

export class CreateEpisodeDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  title: string = "새 에피소드"

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string = ""

  @ApiProperty()
  @IsOptional()
  @IsString()
  chapter: string = ""
}
