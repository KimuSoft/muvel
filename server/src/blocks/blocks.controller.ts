import { Controller, Get } from "@nestjs/common"
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { BlockDto } from "./dto/block.dto"

@Controller("blocks")
@ApiTags("Blocks")
export class BlocksController {
  @Get("search")
  @ApiOperation({
    summary: "블록 검색하기",
    description: "블록을 검색합니다.",
  })
  @ApiOkResponse({
    type: BlockDto,
    isArray: true,
  })
  async searchBlocks() {}
}
