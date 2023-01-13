import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { User } from "./user.entity"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"
import { NovelsModule } from "../novels/novels.module"

@Module({
  imports: [TypeOrmModule.forFeature([User]), NovelsModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
