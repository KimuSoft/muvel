import { ApiProperty } from "@nestjs/swagger"
import { SnapshotReason } from "muvel-api-types"
import { IsEnum, IsOptional } from "class-validator"

export class CreateEpisodeSnapshotDto {
  @ApiProperty({
    description: "스냅샷 생성 이유",
    type: "string",
    enum: SnapshotReason,
    required: false,
    default: SnapshotReason.Manual,
  })
  @IsEnum(SnapshotReason)
  @IsOptional()
  reason: SnapshotReason = SnapshotReason.Manual
}
