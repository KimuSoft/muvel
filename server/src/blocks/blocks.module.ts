import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BlockEntity } from "./block.entity"
import { BlocksService } from "./blocks.service"
import { BlocksController } from "./blocks.controller"

@Module({
  imports: [TypeOrmModule.forFeature([BlockEntity])],
  exports: [BlocksService],
  providers: [BlocksService],
  controllers: [BlocksController],
})
export class BlocksModule {}
