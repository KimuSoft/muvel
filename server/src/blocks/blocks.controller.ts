import { Controller } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"

@Controller("blocks")
@ApiTags("Blocks")
export class BlocksController {}
