import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersModule } from "./users/users.module"
import { NovelsModule } from "./novels/novels.module"
import { BlocksModule } from "./blocks/blocks.module"
import { EpisodesModule } from "./episodes/episodes.module"
import { AuthModule } from "./auth/auth.module"
import * as process from "process"
import { ServeStaticModule } from "@nestjs/serve-static"
import { join } from "path"
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DB_URL,
      autoLoadEntities: true,
    }),
    UsersModule,
    NovelsModule,
    BlocksModule,
    EpisodesModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "..", "client", "dist"),
    }),
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
