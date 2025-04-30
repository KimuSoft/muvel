import { CreateAiAnalysisRequestBody } from "muvel-api-types"
import { IsBoolean } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"

export class CreateAiAnalysisRequestBodyDto
  implements CreateAiAnalysisRequestBody
{
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  @ApiProperty({
    description: "Whether to use the previous summary for the analysis",
    default: false,
    required: false,
    type: Boolean,
  })
  usePreviousSummary?: boolean
}
