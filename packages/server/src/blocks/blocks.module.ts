import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BlockEntity } from "./block.entity"
import { BlocksService } from "./blocks.service"

@Module({
  imports: [TypeOrmModule.forFeature([BlockEntity])],
  providers: [BlocksService],
})
export class BlocksModule {}
