import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersModule } from "./users/users.module"
import { NovelsModule } from "./novels/novels.module"
import { EpisodesModule } from "./episodes/episodes.module"
import { AuthModule } from "./auth/auth.module"
import { SearchModule } from "./search/search.module"
import { ScheduleModule } from "@nestjs/schedule"
import { CharactersModule } from "./characters/characters.module"
import { WikiPagesModule } from "./wiki-pages/wiki-pages.module"
import { GoogleDriveModule } from "./google-drive/google-drive.module"
import { CacheModule } from "@nestjs/cache-manager"

@Module({
  imports: [
    // Libraries
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DB_URL,
      autoLoadEntities: true,
      synchronize: process.env.AUTO_SYNC_DB === "true",
    }),
    ScheduleModule.forRoot(),
    CacheModule.register({ isGlobal: true }),

    // Modules
    UsersModule,
    NovelsModule,
    EpisodesModule,
    AuthModule,
    SearchModule,
    CharactersModule,
    WikiPagesModule,
    GoogleDriveModule,
  ],
})
export class AppModule {}
