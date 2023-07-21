import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { NovelEntity } from "./novel.entity"
import { NovelsService } from "./novels.service"
import { EpisodesModule } from "../episodes/episodes.module"
import { NovelsController } from "./novels.controller"
import { UserEntity } from "../users/user.entity"
import { SearchModule } from "../search/search.module"
import { multerOptionsFactory } from "../commons/utils/multer.option.factory"
import { MulterModule } from "@nestjs/platform-express"

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([NovelEntity, UserEntity]),
    MulterModule.registerAsync({
      useFactory: multerOptionsFactory,
    }),
    EpisodesModule,
    SearchModule,
  ],
  exports: [NovelsService],
  providers: [NovelsService],
  controllers: [NovelsController],
})
export class NovelsModule {}
