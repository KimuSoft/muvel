import { IsUUID } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class UuIdParamDto {
  @IsUUID()
  @ApiProperty({ title: "ID" })
  id: string
}
