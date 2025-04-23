import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersModule } from "./users/users.module"
import { NovelsModule } from "./novels/novels.module"
import { BlocksModule } from "./blocks/blocks.module"
import { EpisodesModule } from "./episodes/episodes.module"
import { AuthModule } from "./auth/auth.module"
import * as process from "process"
import { SearchModule } from "./search/search.module"

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DB_URL,
      autoLoadEntities: true,
      synchronize: process.env.AUTO_SYNC_DB === "true",
    }),
    UsersModule,
    NovelsModule,
    BlocksModule,
    EpisodesModule,
    AuthModule,
    SearchModule,
  ],
})
export class AppModule {}
