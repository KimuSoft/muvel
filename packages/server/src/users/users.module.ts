import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "./user.entity"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"
import { NovelsModule } from "../novels/novels.module"

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), NovelsModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
