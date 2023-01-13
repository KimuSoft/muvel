import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Block } from "./block.entity"
import { BlocksService } from "./blocks.service"

@Module({
  imports: [TypeOrmModule.forFeature([Block])],
  exports: [BlocksService],
  providers: [BlocksService],
})
export class BlocksModule {}
