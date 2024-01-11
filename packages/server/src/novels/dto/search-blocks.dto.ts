import { ApiProperty } from "@nestjs/swagger"
import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator"

export class SearchBlocksDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  content: string = ""

  @ApiProperty({ required: false, default: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  display: number = 20

  @ApiProperty({ required: false, default: 0 })
  @IsNumber()
  @Min(0)
  start: number = 0
}
